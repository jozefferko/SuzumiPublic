import * as functions from "firebase-functions";
import {
    achievementIndexes,
    FSCachedTransaction,
    FSFeedbackStat,
    FSPathMap,
    FSRestaurant,
    FSTier,
    FSUser,
} from "../../../common/types/firestore";
import { userSearchIndexBuilder } from "../../../common/utils/searchIndexes";
import {
    fMap,
    fThen,
    mapMaybe,
    mapMaybeAsync,
    maybeAll,
    orDefaultMaybe,
    tapMaybeAsync,
} from "../../../common/utils/fp";
import _ from "lodash/fp";
import {
    checkDocument,
    fsFieldValue,
    fsUpload,
    fsUploadType,
} from "../../../common/utils/firestore/queries";
import { Maybe } from "purify-ts/Maybe";
import { DeepPartial, Dictionary } from "../../../common/types/misc";
import { MaybeAsync } from "purify-ts";
import { FieldValue, WriteResult } from "../../../commonDefs/definitions";
import { memoFSGet } from "../../../utils/cached";
import {
    currentDay,
    secondsSinceFSTimestamp,
    withinMonthsPredicate,
} from "../../../common/utils/dateOperations";
import {
    deNormalize,
    dotAnnotate,
} from "../../../common/utils/firestore/normalize";
import { unicastNotification } from "../../../utils/notifications";
import {
    MultilingualNotification,
    tiersUnlockedNotification,
} from "../../../common/types/notifications";
import { calculateTierExpiry } from "../../../utils/misc";

const promotionNotifications: MultilingualNotification = {
    dk: {
        title: "Promotion",
        body: "Dansk dansk dansk dansk",
    },
    en: {
        title: "Promotion",
        body: "You have been promoted!, open the app to find out more",
    },
};

const getRestaurant = memoFSGet(FSPathMap.restaurant, 10800000); //invalidate after 3 hours

type SafeChange = Maybe<FSUser[]>;
type UserUpdater = (
    change: SafeChange,
    eventID: string
) => Maybe<DeepPartial<FSUser>>;
type AsyncUserUpdater = (
    change: SafeChange,
    eventID: string
) => MaybeAsync<DeepPartial<FSUser>>;

const updateSearchIndexes: UserUpdater = (
    change: SafeChange
): Maybe<DeepPartial<FSUser>> =>
    change
        .map(_.map(userSearchIndexBuilder))
        .filter(([after, before]) => !_.isEqual(after, before))
        .map(([newIndexes, oldIndexes]) => ({ searchIndex: newIndexes }));
const getUnlockTiersProgress = (user: FSUser): number =>
    user.achievementStatus[achievementIndexes.unlockTiers]?.progress ?? 0;

const updateUnlockTiersAchievement: AsyncUserUpdater = (change) =>
    MaybeAsync.liftMaybe(
        change.chain(
            Maybe.fromPredicate(
                ([after, before]) =>
                    (after.achievementStatus[achievementIndexes.unlockTiers]
                        ?.claimed ?? -1) < 0 && after.balance > before.balance
            )
        )
    ).chain(([after, before]) =>
        getRestaurant().chain(
            _.flow(
                ($) =>
                    $.achievements[achievementIndexes.unlockTiers].tiers[0]
                        .goal,
                Maybe.fromPredicate(
                    (goal) => getUnlockTiersProgress(after) < goal
                ),
                MaybeAsync.liftMaybe,
                tapMaybeAsync(async (goal) => {
                    if (
                        getUnlockTiersProgress(after) +
                            after.balance -
                            before.balance >=
                        goal
                    )
                        await unicastNotification(tiersUnlockedNotification)(
                            after.id
                        );
                }),
                mapMaybeAsync((goal: number) => after.balance - before.balance),
                mapMaybeAsync(($) => ({
                    achievementStatus: {
                        [achievementIndexes.unlockTiers]: {
                            progress: fsFieldValue(FieldValue.increment($)),
                        },
                    },
                }))
            )
        )
    );

const sumRecentTransactions = (
    recentTransactions: Dictionary<FSCachedTransaction>
) =>
    Object.values(recentTransactions)
        .map(($) => $.amount)
        .reduce((acc, val) => acc + val, 0);

const checkForTierPromotion: AsyncUserUpdater = (safeChange) =>
    MaybeAsync.liftMaybe(
        safeChange
            .filter(($) => $[0].tiers.enabled)
            .filter(
                (change) =>
                    !change[1].tiers.enabled ||
                    _.flow(
                        fMap<FSUser, { [id: string]: FSCachedTransaction }>(
                            ($) => $.recentPoints
                        ),
                        ($) => !_.isEqual($[0], $[1])
                    )(change)
            )
    ).chain(([after, before]) =>
        getRestaurant().chain((restaurant) =>
            MaybeAsync.liftMaybe(Maybe.of(restaurant))
                .filter(
                    (r) => r.tiers.tiers.length - 1 >= after.tiers.currentTier
                )
                .map(
                    _.flow(
                        ($) => $.tiers.tiers,
                        _.findLastIndex<FSTier>(
                            (tier) =>
                                tier.points <=
                                sumRecentTransactions(after.recentPoints)
                        )
                    )
                )
                .filter((newIndex) => newIndex > after.tiers.currentTier)
                .map(
                    (newIndex): DeepPartial<FSUser> => ({
                        tiers: {
                            currentTier: newIndex,
                            expiry: calculateTierExpiry(newIndex, restaurant),
                        },
                    })
                )
                .chain(async (user) => {
                    if (restaurant.tiers.enabled)
                        await unicastNotification(promotionNotifications)(
                            after.id
                        );
                    return Maybe.of(user);
                })
        )
    );

const updateAccumulatedProgress: AsyncUserUpdater = (change, eventID) =>
    MaybeAsync.liftMaybe(change)
        .filter(([after, before]) => after.balance > before.balance)
        .chain(([after, before]) =>
            getRestaurant().map((restaurant: FSRestaurant) =>
                _.flow(
                    ($: FSRestaurant) => $.tiers.expiryPeriod,
                    (period): string[] =>
                        Object.keys(after.recentPoints).filter(
                            _.flow(
                                ($) => after.recentPoints[$].created,
                                withinMonthsPredicate(period),
                                ($) => !$
                            )
                        ),
                    ($: string[]) => ({
                        ...$.reduce(
                            (acc, val) => ({
                                ...acc,
                                [val]: fsFieldValue(FieldValue.delete()),
                            }),
                            {}
                        ),
                        [eventID]: {
                            created: fsFieldValue(FieldValue.serverTimestamp()),
                            amount: after.balance - before.balance,
                        },
                    }),
                    ($) => ({
                        recentPoints: $,
                        // ...checkForTierPromotion($, restaurant, after).orDefault(
                        //     {}
                        // ),
                    })
                )(restaurant)
            )
        );

const updateAmountToMaintain: UserUpdater = (change) =>
    change
        .filter(
            ([after, before]) =>
                after.tiers.expiry.expires &&
                after.balance > before.balance &&
                secondsSinceFSTimestamp(after.tiers.expiry.start) > 0 &&
                after.tiers.expiry.amountToMaintain > 0
        )
        .map(([after, before]) => ({
            tiers: {
                expiry: {
                    amountToMaintain: fsFieldValue(
                        FieldValue.increment(-(after.balance - before.balance))
                    ),
                },
            },
        }));

const moveTierExpiryPeriod: AsyncUserUpdater = (change) =>
    MaybeAsync.liftMaybe(change)
        .filter(
            ([after, before]) =>
                after.tiers.expiry.amountToMaintain <= 0 &&
                before.tiers.expiry.amountToMaintain > 0
        )
        .chain(([after, before]) =>
            getRestaurant().map((restaurant) => ({
                tiers: {
                    expiry: calculateTierExpiry(
                        after.tiers.currentTier,
                        restaurant,
                        after.tiers.expiry.end
                    ),
                },
            }))
        );

const undefinedToEmptyDic = <A>(
    val: { [i: string]: A } | undefined
): { [i: string]: A } => val ?? {};
const dicKeys = _.flow(undefinedToEmptyDic, Object.keys);
const getFSStatIncrements = (
    after: Maybe<boolean>,
    before: Maybe<boolean>
): FSFeedbackStat => ({
    positive:
        before.filter(_.identity).mapOrDefault(_.always(-1), 0) +
        after.filter(_.identity).mapOrDefault(_.always(1), 0),
    answers:
        before.mapOrDefault(_.always(-1), 0) +
        after.mapOrDefault(_.always(1), 0),
});
const feedbackChange = ([after, before]: FSUser[]) =>
    [
        ...new Set([
            ...dicKeys(after.feedback?.answers),
            ...dicKeys(before.feedback?.answers),
        ]),
    ].reduce(
        (acc: { [i: string]: FSFeedbackStat }, key) => ({
            ...acc,
            [key]: getFSStatIncrements(
                Maybe.fromNullable(after.feedback?.answers).map((a) => a[key]),
                Maybe.fromNullable(before.feedback?.answers).map((a) => a[key])
            ),
        }),
        {}
    );

const numToFSIncrement = (val: number) =>
    fsFieldValue(FieldValue.increment(val));
const updateFeedbackStats: AsyncUserUpdater = (change) =>
    MaybeAsync.liftMaybe(change)
        .filter(
            ([after, before]) =>
                !_.isEqual(after.feedback?.answers, before.feedback?.answers)
        )
        .map(feedbackChange)
        .filter(($) => Object.keys($).length > 0)
        .chain((feedbacks) =>
            fsUpload({
                path: FSPathMap.stats,
                type: fsUploadType.update,
                data: {
                    feedback: Object.keys(feedbacks).reduce(
                        (
                            acc: { [i: string]: DeepPartial<FSFeedbackStat> },
                            key
                        ) => ({
                            ...acc,
                            [key]: {
                                positive: numToFSIncrement(
                                    feedbacks[key].positive
                                ),
                                answers: numToFSIncrement(
                                    feedbacks[key].answers
                                ),
                            },
                        }),
                        {}
                    ),
                },
            }).then(($) => Maybe.of({}))
        );

const updatePointExpiry: AsyncUserUpdater = (change) =>
    MaybeAsync.liftMaybe(
        change.filter(([after, before]) => after.balance !== before.balance)
    )
        .chain(getRestaurant)
        .map((restaurant) => ({
            expiryDate: currentDay(restaurant.expiry.expire.months),
        }));

const toAsyncUpdater = (updater: UserUpdater): AsyncUserUpdater =>
    _.flow(updater, MaybeAsync.liftMaybe);
const updaters: AsyncUserUpdater[] = [
    toAsyncUpdater(updateSearchIndexes),
    toAsyncUpdater(updateAmountToMaintain),
    updateUnlockTiersAchievement,
    updateAccumulatedProgress,
    checkForTierPromotion,
    updatePointExpiry,
    moveTierExpiryPeriod,
    updateFeedbackStats,
];
const applyUpdaters = (safeChange: SafeChange, eventId: string) =>
    updaters.map((updater) => updater(safeChange, eventId));
const mergeUpdates = (updates: DeepPartial<FSUser>[]): DeepPartial<FSUser> =>
    updates.reduce(
        (
            acc: DeepPartial<FSUser>,
            val: DeepPartial<FSUser>
        ): DeepPartial<FSUser> => ({ ...acc, ...val }),
        {}
    );

export const updateUserDoc = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.users.path}/{userId}`)
    .onUpdate((change, event) => {
        const safeChange: SafeChange = maybeAll(
            checkDocument(FSPathMap.users.runtype)(change.after).toMaybe(),
            checkDocument(FSPathMap.users.runtype)(change.before).toMaybe()
        );
        return _.flow(
            applyUpdaters,
            MaybeAsync.catMaybes,
            fThen(
                _.flow(
                    Maybe.fromPredicate<DeepPartial<FSUser>[]>(
                        ($) => $.length > 0
                    ),
                    mapMaybe(mergeUpdates),
                    mapMaybe<DeepPartial<FSUser>, Promise<WriteResult>>(
                        (data) =>
                            change.after.ref.update(
                                _.flow(dotAnnotate, deNormalize)(data)
                            )
                    ),
                    orDefaultMaybe(null)
                )
            )
        )(safeChange, event.eventId);
    });
