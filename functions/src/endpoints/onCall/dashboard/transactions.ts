import { createRoute, onCallSignatures } from "../../../common/types/calls";
import { fFilter, tapLog, tapMaybeAsync } from "../../../common/utils/fp";
import {
    FSPathMap,
    FSTimestamp,
    FSTransaction,
    FSUser,
} from "../../../common/types/firestore";
import { fsFieldValue } from "../../../common/utils/firestore/queries";
import {
    fsRunTransaction,
    FsTransaction,
} from "../../../common/utils/firestore/fsTransaction";
import _ from "lodash/fp";
import { FieldValue } from "../../../commonDefs/definitions";
import { serverTimestamp } from "../../../common/utils/firestore/normalize";

const timestampDiff = (
    timestamp1: FSTimestamp,
    timestamp2: FSTimestamp
): number =>
    tapLog("timeDifference")(Math.abs(timestamp1.seconds - timestamp2.seconds));
const findCachedTransaction = (
    transaction: FSTransaction,
    user: FSUser
): string =>
    _.flow(
        ($) => $.recentPoints,
        Object.keys,
        fFilter((key) => user.recentPoints[key].amount === transaction.amount),
        _.minBy((key: string) =>
            timestampDiff(user.recentPoints[key].created, transaction.timestamp)
        )
    )(user);

const cancelOrderTransaction = (transaction: FsTransaction) => (
    tData: FSTransaction
) => (user: FSUser) =>
    transaction
        .update(FSPathMap.users.doc(tData.user))({
            balance: fsFieldValue(FieldValue.increment(-tData.amount)),
            recentPoints: {
                [findCachedTransaction(tData, user) ?? "a"]: fsFieldValue(
                    FieldValue.delete()
                ),
            },
        })
        .set(FSPathMap.transactions)({
        id: "",
        amount: -tData.amount,
        user: tData.user,
        ref: tData.id,
        plainRef: {
            en: "correction",
            dk: "correction",
        },
        type: "correction",
        timestamp: serverTimestamp(),
    });

export const cancelOrder = createRoute(
    onCallSignatures.cancelOrder,
    ({ transaction: tId }) =>
        fsRunTransaction((transaction) =>
            transaction
                .get(FSPathMap.transactions.doc(tId))
                .chain((tData) =>
                    transaction
                        .get(FSPathMap.users.doc(tData.user))
                        .extend(
                            tapMaybeAsync<FSUser>(
                                cancelOrderTransaction(transaction)(tData)
                            )
                        )
                )
                .run()
        )
            .then(() => ({ message: "", status: true }))
            .catch(() => ({ message: "", status: true }))
);
