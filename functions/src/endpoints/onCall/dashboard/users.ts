import * as admin from "firebase-admin";
import { sendSMS } from "../../../utils/sms";
import { createRoute, onCallSignatures } from "../../../common/types/calls";
import { Maybe, MaybeAsync } from "purify-ts";
import { catchLog, nothingLog, tapLog } from "../../../common/utils/fp";
import { createFSUser } from "../../../common/utils/firestore/userOperations";
import {
    fsUpload,
    fsUploadType,
} from "../../../common/utils/firestore/queries";
import { FSPathMap, FSUser } from "../../../common/types/firestore";
import { DeepPartial } from "../../../common/types/misc";
import { Static } from "runtypes/lib/runtype";
import _ from "lodash/fp";
import { calculateTierExpiry } from "../../../utils/misc";
import { memoFSGet } from "../../../utils/cached";

const getRestaurant = memoFSGet(FSPathMap.restaurant, 10800000); //invalidate after 3 hours

export const createUser = createRoute(
    onCallSignatures.createUser,
    ({ phoneNumber, displayName, email, birthday }) =>
        admin
            .auth()
            .createUser({
                ...(phoneNumber ? { phoneNumber: phoneNumber } : {}),
                emailVerified: false,
                displayName: displayName,
                disabled: false,
            })
            .catch(catchLog)
            .then(
                (user): Promise<Maybe<string>> =>
                    createFSUser(
                        user.uid,
                        email,
                        phoneNumber,
                        displayName,
                        birthday
                    ).then((result) =>
                        result
                            .ifNothing(() => console.log("user not created"))
                            .map(() => user.uid)
                    )
            )
            .then((safeResult) =>
                phoneNumber
                    ? MaybeAsync.liftMaybe(
                          safeResult.ifNothing(nothingLog("noNewDoc"))
                      )
                          .chain((l) =>
                              sendSMS(
                                  "Suzumi",
                                  "finish signUp in the app",
                                  phoneNumber.replace("+", "")
                              ).then(() => safeResult)
                          )
                          .run()
                    : safeResult
            )
            .then((safeResult) =>
                safeResult
                    .ifJust(tapLog("uid"))
                    .ifNothing(nothingLog("uid"))
                    .mapOrDefault(($) => ({ message: $, status: true }), {
                        message: "",
                        status: false,
                    })
            )
);

type ArgKey = keyof Omit<
    Static<typeof onCallSignatures.updateUser.args>,
    "tier"
>;
export const updateUser = createRoute(
    onCallSignatures.updateUser,
    async ({ tier: unsafeTier, ...args }) => {
        try {
            if (args.phoneNumber)
                await admin.auth().updateUser(args.id, {
                    phoneNumber: args.phoneNumber,
                });

            const tiers = await MaybeAsync.liftMaybe(
                Maybe.fromNullable(unsafeTier)
            ).chain((tier) =>
                getRestaurant().map((restaurant) => ({
                    tiers: {
                        currentTier: tier,
                        expiry: calculateTierExpiry(tier, restaurant),
                    },
                }))
            );
            await fsUpload({
                type: fsUploadType.update,
                path: FSPathMap.users.doc(args.id),
                data: {
                    ...tiers.extract(),
                    ..._.reduce((acc: DeepPartial<FSUser>, val: ArgKey) =>
                        args[val] ? { ...acc, [val]: args[val] } : acc
                    )({})(Object.keys(args) as ArgKey[]),
                },
            });

            return { message: "OK", status: true };
        } catch (e) {
            return { message: "", status: false };
        }
    }
);

export const deleteUser = createRoute(
    onCallSignatures.deleteUser,
    async (args) => {
        try {
            await admin.auth().deleteUser(args.id);
            return { message: "OK", status: true };
        } catch (e) {
            return { message: "failed to delete", status: false };
        }
    }
);
