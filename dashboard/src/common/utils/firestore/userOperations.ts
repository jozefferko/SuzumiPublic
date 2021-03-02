import _ from "lodash/fp";
import { Maybe, MaybeAsync } from "purify-ts";
import {
    achievementIndexes,
    FSBirthday,
    FSPathMap,
    FSRestaurant,
    FSUser,
} from "../../types/firestore";
import { currentDay } from "../dateOperations";
import { nothingLog, tapLog } from "../fp";
import { stubSearchIndex } from "../searchIndexes";
import { fsRunTransaction } from "./fsTransaction";
import { serverTimestamp } from "./normalize";

export const createUserDoc = (
    email: string,
    phoneNumber: string,
    displayName: string,
    birthday?: FSBirthday
) => (restaurant: FSRestaurant): FSUser => ({
    id: "",
    email: email,
    referralCount: 0,
    referredBy: "",
    balance: restaurant.achievements[0].tiers[0].reward,
    phoneNumber: phoneNumber,
    created: serverTimestamp(),
    flags: ["active"],
    photoUrl: "",
    displayName: displayName,
    expiryDate: currentDay(restaurant.expiry.expire.months),
    searchIndex: stubSearchIndex(),
    achievementStatus: {
        [achievementIndexes.register]: {
            progress: 1,
        },
        // [achievementIndexes.unlockTiers]: {
        //     progress: restaurant.achievements[0].tiers[0].reward,
        //     claimed: 0,
        // },
    },
    recentPoints: {
        // "0": {
        //     amount: restaurant.achievements[0].tiers[0].reward,
        //     created: {
        //         seconds: Math.floor(new Date().getTime() / 1000),
        //         nanoseconds: 0,
        //     },
        // },
    },
    ...(birthday ? { birthday } : {}),
    tiers: {
        enabled: false,
        currentTier: 0,
        expiry: {
            amountToMaintain: 0,
            expires: false,
            start: serverTimestamp(),
            end: serverTimestamp(),
        },
    },
});

export const createFSUser = (
    id: string,
    email: string,
    phoneNumber: string,
    displayName: string,
    birthday?: FSBirthday
) =>
    fsRunTransaction((transaction) =>
        transaction
            .exists(FSPathMap.users.doc(id))
            .map(tapLog("does user exist"))
            .chain(
                _.flow(
                    Maybe.fromPredicate(_.equals(false)),
                    MaybeAsync.liftMaybe
                )
            )
            .map(tapLog("user checked"))
            .chain(() => transaction.get(FSPathMap.restaurant))
            .run()
            .then((safeRestaurant) =>
                safeRestaurant
                    .ifJust(nothingLog("restaurant fetched"))
                    .map((restaurant) =>
                        transaction
                            // .set(FSPathMap.transactions)({
                            //     id: '',
                            //     amount:
                            //         restaurant.achievements[0].tiers[0].reward,
                            //     user: id,
                            //     ref: '0/0',
                            //     plainRef:
                            //         restaurant.achievements[0].tiers[0]
                            //             .displayName,
                            //     type: 'achievement',
                            //     timestamp: serverTimestamp(),
                            // })
                            .set(FSPathMap.users.doc(id))(
                            createUserDoc(
                                email,
                                phoneNumber,
                                displayName,
                                birthday
                            )(restaurant)
                        )
                    )
                    .ifJust(nothingLog("user created"))
                    .map(() => true)
            )
    );
