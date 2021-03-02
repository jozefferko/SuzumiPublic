import {
    createAppRoute,
    onCallAppSignatures,
} from "../../../common/types/calls";
import {
    fsRunTransaction,
    FsTransaction,
} from "../../../common/utils/firestore/fsTransaction";
import { maybeAsyncAll, tapMaybeAsync } from "../../../common/utils/fp";
import {
    FSPathMap,
    FSRestaurant,
    FSUser,
} from "../../../common/types/firestore";
import { serverTimestamp } from "../../../common/utils/firestore/normalize";
import { Maybe } from "purify-ts/Maybe";
import _ from "lodash/fp";

const getCurrentTier = (achievementId: number) => (user: FSUser): number =>
    Maybe.fromNullable(
        user.achievementStatus[achievementId]?.claimed
    ).orDefault(-1);
const getCurrentProgress = (achievementId: number) => (user: FSUser): number =>
    Maybe.fromNullable(
        user.achievementStatus[achievementId]?.progress
    ).orDefault(-1);
const calculateTier = (achievementId: number, user: FSUser) => (
    restaurant: FSRestaurant
): number =>
    Maybe.fromNullable(
        _.findLastIndex(
            (achievement) =>
                achievement.goal <= getCurrentProgress(achievementId)(user),
            restaurant.achievements[achievementId].tiers
        )
    ).orDefault(-1);

const claimAchievementTransaction = (
    transaction: FsTransaction,
    achievementId: number
) => ([user, restaurant]: [FSUser, FSRestaurant]): FsTransaction =>
    (restaurant.achievements[achievementId].tiers[
        getCurrentTier(achievementId)(user) + 1
    ].reward
        ? transaction.set(FSPathMap.transactions)({
              id: "",
              amount:
                  restaurant.achievements[achievementId].tiers[
                      getCurrentTier(achievementId)(user) + 1
                  ].reward,
              user: user.id,
              ref: `${achievementId}/${
                  getCurrentTier(achievementId)(user) + 1
              }`,
              plainRef: {
                  en: "Completing an achievement",
                  dk: "Completing an achievement",
              },
              type: "achievement",
              timestamp: serverTimestamp(),
          })
        : transaction
    ).update(FSPathMap.users.doc(user.id))({
        balance:
            user.balance +
            restaurant.achievements[achievementId].tiers[
                getCurrentTier(achievementId)(user) + 1
            ].reward,
        achievementStatus: {
            [achievementId]: {
                progress: getCurrentProgress(achievementId)(user),
                claimed: getCurrentTier(achievementId)(user) + 1,
            },
        },
    });

export const claimAchievementRoute = createAppRoute(
    onCallAppSignatures.claimAchievement,
    (uid) => ({ achievementID }) =>
        fsRunTransaction((transaction) =>
            maybeAsyncAll(
                transaction.get(FSPathMap.users.doc(uid)),
                transaction.get(FSPathMap.restaurant)
            )
                .filter(
                    ([user, restaurant]) =>
                        getCurrentTier(achievementID)(user) <
                        calculateTier(achievementID, user)(restaurant)
                )
                .extend(
                    tapMaybeAsync(
                        claimAchievementTransaction(transaction, achievementID)
                    )
                )
                .run()
        )
            .then(() => ({ message: "", status: true }))
            .catch(() => ({ message: "", status: false }))
);
