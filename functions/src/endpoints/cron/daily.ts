import * as functions from "firebase-functions"; // tslint:disable-next-line:no-duplicate-imports
import { EventContext } from "firebase-functions";
import { Maybe } from "purify-ts/Maybe";
import { fsGet } from "../../common/utils/firestore/getters";
import {
    fsUpload,
    fsUploadType,
    whereFactory,
    WhereParams,
} from "../../common/utils/firestore/queries";
import {
    contestWon,
    notifyBeforeExpiry,
    pointsExpired,
    tierExpired,
} from "../../common/types/notifications";
import {
    broadcastNotification,
    unicastNotification,
} from "../../utils/notifications";
import {
    FSContestEntry,
    FSOffer,
    FSPathMap,
    FSUser,
} from "../../common/types/firestore";
import { memoFSGet } from "../../utils/cached";
import { calculateTierExpiry } from "../../utils/misc";
import { MaybeAsync } from "purify-ts";
import _ from "lodash/fp";
import {
    addToTimestamp,
    secondsSinceFSTimestamp,
} from "../../common/utils/dateOperations";
import { fFilter, fReduce } from "../../common/utils/fp";
import { serverTimestamp } from "../../common/utils/firestore/normalize";

type asyncEffect = (context: EventContext) => Promise<any>;
const getRestaurant = memoFSGet(FSPathMap.restaurant, 3600000); //invalidate after 1 hour

const whereExpiry = (days: number): WhereParams[] => {
    const from = new Date();
    const to = new Date();
    from.setDate(from.getDate() + days);
    to.setDate(to.getDate() + days + 1);
    return [
        whereFactory("expiryDate", "<", from),
        whereFactory("expiryDate", ">", to),
    ];
};

const expiryNotification: asyncEffect = (context) =>
    getRestaurant()
        .chain((restaurant) =>
            MaybeAsync.catMaybes(
                restaurant.expiry.notify
                    .map((notify) => notify.days)
                    .map(
                        (daysBefore): MaybeAsync<any> =>
                            fsGet<FSUser>({
                                path: FSPathMap.users,
                                options: {
                                    where: [
                                        whereFactory("balance", ">", 0),
                                        ...whereExpiry(daysBefore),
                                    ],
                                },
                            })
                                .toMaybeAsync()
                                .chain(async (expiredUsers) => {
                                    await Promise.all(
                                        expiredUsers.map((expiredUser) =>
                                            unicastNotification(
                                                notifyBeforeExpiry(daysBefore)
                                            )(expiredUser.id)
                                        )
                                    );
                                    return Maybe.of(expiredUsers);
                                })
                    )
            ).then(Maybe.of)
        )
        .run();

const expirePoints: asyncEffect = (context) =>
    fsGet<FSUser>({
        path: FSPathMap.users,
        options: {
            where: [
                whereFactory("balance", ">", 0),
                whereFactory("expiryDate", "<", new Date()),
            ],
        },
    })
        .toMaybeAsync()
        .chain(async (expiredUsers) => {
            await Promise.all(
                expiredUsers.map((expiredUser) =>
                    unicastNotification(pointsExpired)(expiredUser.id)
                )
            );
            await Promise.all(
                expiredUsers.map((expiredUser) =>
                    fsUpload({
                        path: FSPathMap.users.doc(expiredUser.id),
                        data: { balance: 0 },
                        type: fsUploadType.update,
                    })
                )
            );
            return Maybe.of(expiredUsers);
        })
        .run();

const expireTiers: asyncEffect = (context) =>
    fsGet<FSUser>({
        path: FSPathMap.users,
        options: {
            where: [
                whereFactory("tiers.enabled", "==", true),
                whereFactory("tiers.expiry.expires", "==", true),
                whereFactory("tiers.expiry.amountToMaintain", ">", 0),
                whereFactory("tiers.expiry.end", "<", new Date()),
            ],
        },
    })
        .toMaybeAsync()
        .chain(async (expiredUsers) => {
            await getRestaurant()
                .chain(async (restaurant) => {
                    if (restaurant.tiers.enabled)
                        await Promise.all(
                            expiredUsers.map((expiredUser) =>
                                unicastNotification(tierExpired)(expiredUser.id)
                            )
                        );
                    return Maybe.of(restaurant);
                })
                .run()
                .then((safeRestaurant) =>
                    safeRestaurant
                        .map((restaurant) =>
                            Promise.all(
                                expiredUsers.map((expiredUser) =>
                                    fsUpload({
                                        path: FSPathMap.users.doc(
                                            expiredUser.id
                                        ),
                                        data: {
                                            tiers: {
                                                currentTier:
                                                    expiredUser.tiers
                                                        .currentTier - 1,
                                                expiry: calculateTierExpiry(
                                                    expiredUser.tiers
                                                        .currentTier - 1,
                                                    restaurant
                                                ),
                                            },
                                        },
                                        type: fsUploadType.update,
                                    })
                                )
                            )
                        )
                        .extract()
                );
            return Maybe.of(expiredUsers);
        })
        .run();

const randomFromArray = <A>(arr: A[]): A =>
    arr[Math.floor(Math.random() * arr.length)];
const getContestWinner = (entries: FSContestEntry[]): string =>
    _.flow(
        fReduce<FSContestEntry, number[]>(
            (acc: number[], val: FSContestEntry, index) => [
                ...acc,
                ...new Array(val.entries).map(_.always(index)),
            ]
        )([]),
        randomFromArray,
        ($) => entries[$].user
    )(entries);
const endContest: asyncEffect = () =>
    getRestaurant()
        .filter(
            _.flow(
                ($) => $.contest.current.endDate,
                secondsSinceFSTimestamp,
                ($) => $ >= 0
            )
        )
        .chain((restaurant) =>
            fsGet({
                path: FSPathMap.contest,
                options: {
                    where: [
                        whereFactory(
                            "endDate",
                            "==",
                            restaurant.contest.current.endDate
                        ),
                    ],
                },
            })
                .toMaybeAsync()
                .map(Object.values)
                .filter(($) => $.length > 0)
                .map(getContestWinner)
                .chain(async (uid) => {
                    await unicastNotification(contestWon)(uid);
                    return Maybe.of(uid);
                })
                .chain((uid) =>
                    fsUpload({
                        path: FSPathMap.purchases,
                        type: fsUploadType.set,
                        data: {
                            id: "",
                            purchased: serverTimestamp(),
                            product: restaurant.contest.current.product,
                            user: uid,
                            flags: [],
                        },
                    }).then(Maybe.of)
                )
                .filter(($) => restaurant.contest.enabled)
                .chain(() =>
                    fsUpload({
                        path: FSPathMap.restaurant,
                        type: fsUploadType.update,
                        data: {
                            contest: {
                                current: {
                                    price: restaurant.contest.upcoming.price,
                                    product:
                                        restaurant.contest.upcoming.product,
                                    endDate: addToTimestamp({
                                        months:
                                            restaurant.contest.upcoming.months,
                                    })(restaurant.contest.current.endDate),
                                },
                            },
                        },
                    }).then(Maybe.of)
                )
        )
        .run();

const dailyJobList: asyncEffect[] = [
    expirePoints,
    expireTiers,
    expiryNotification,
    endContest,
];

export const dailyCron = functions
    .region("europe-west3")
    .pubsub.schedule("every day 00:10")
    .timeZone("Europe/Copenhagen")
    .onRun((context) => {
        return Promise.all(dailyJobList.map((job) => job(context)));
    });

const publishedNewsNotifications: asyncEffect = (context) =>
    fsGet<FSOffer>({
        path: FSPathMap.offers,
        options: {
            where: [whereFactory("publish", "<", new Date())],
        },
    })
        .toMaybeAsync()
        .map(
            fFilter<FSOffer>(
                (offer) => secondsSinceFSTimestamp(offer.publish) < 60 * 60 * 24
            )
        )
        .chain(async (offers) => {
            await Promise.all(
                offers.map((offer) =>
                    broadcastNotification({
                        en: {
                            body: offer.description.en || offer.description.dk,
                            title: offer.displayName.en || offer.displayName.dk,
                        },
                        dk: {
                            body: offer.description.dk || offer.description.en,
                            title: offer.displayName.dk || offer.displayName.en,
                        },
                    })
                )
            );
            return Maybe.of(offers);
        })
        .run();

const noonJobList: asyncEffect[] = [publishedNewsNotifications];
export const noonCron = functions
    .region("europe-west3")
    .pubsub.schedule("every day 11:50")
    .timeZone("Europe/Copenhagen")
    .onRun((context) => {
        return Promise.all(noonJobList.map((job) => job(context)));
    });
