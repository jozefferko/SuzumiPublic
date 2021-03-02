import {
    createAppRoute,
    onCallAppSignatures,
} from "../../../common/types/calls";
import {
    fsRunTransaction,
    FsTransaction,
} from "../../../common/utils/firestore/fsTransaction";
import {
    FSContestEntry,
    FSPathMap,
    FSProduct,
    FSRestaurant,
    FSUser,
} from "../../../common/types/firestore";
import {
    maybeAsyncAll,
    nothingLog,
    tapMaybeAsync,
} from "../../../common/utils/fp";
import { serverTimestamp } from "../../../common/utils/firestore/normalize";
import { purchaseRef } from "../../../common/types/transactionRefs";
import { fsGet } from "../../../common/utils/firestore/getters";
import {
    fsFieldValue,
    whereFactory,
} from "../../../common/utils/firestore/queries";
import { FieldValue } from "../../../commonDefs/definitions";
import { Maybe } from "purify-ts/Maybe";

const purchaseProductTransaction = (transaction: FsTransaction) => ([
    user,
    product,
]: [FSUser, FSProduct]) =>
    transaction
        .update(FSPathMap.users.doc(user.id))({
            balance: user.balance - product.price,
        })
        .set(FSPathMap.purchases)({
            id: "",
            purchased: serverTimestamp(),
            product: product.id,
            user: user.id,
            flags: [],
        })
        .set(FSPathMap.transactions)({
        id: "",
        amount: -product.price,
        user: user.id,
        ref: product.id,
        plainRef: purchaseRef,
        type: "purchase",
        timestamp: serverTimestamp(),
    });
const sufficientBalancePredicate = ([user, product]: [FSUser, FSProduct]) =>
    product.price <= user.balance;

export const purchaseRoute = createAppRoute(
    onCallAppSignatures.purchase,
    (uid) => ({ productID }) =>
        fsRunTransaction((transaction) =>
            maybeAsyncAll(
                transaction.get(FSPathMap.users.doc(uid)),
                transaction.get(FSPathMap.products.doc(productID))
            )
                .filter(sufficientBalancePredicate)
                .extend(tapMaybeAsync(purchaseProductTransaction(transaction)))
                .run()
        )
            .then(() => ({ message: "", status: true }))
            .catch(() => ({ message: "", status: false }))
);

export const activateRoute = createAppRoute(
    onCallAppSignatures.activate,
    (uid) => ({ purchaseID }) =>
        fsRunTransaction((transaction) =>
            transaction
                .get(FSPathMap.purchases.doc(purchaseID))
                .filter(($) => !$.activated && $.user === uid)
                .extend(
                    tapMaybeAsync(() =>
                        transaction.update(FSPathMap.purchases.doc(purchaseID))(
                            {
                                activated: serverTimestamp(),
                            }
                        )
                    )
                )
                .run()
        )
            .then(() => ({ message: "", status: true }))
            .catch(() => ({ message: "", status: false }))
);

const purchaseContestTransaction = (
    transaction: FsTransaction,
    safeContest: Maybe<FSContestEntry>,
    count: number
) => ([user, restaurant]: [FSUser, FSRestaurant]) =>
    safeContest
        .ifNothing(nothingLog("no contest"))
        .caseOf({
            Just: (contestEntry) =>
                transaction.update(FSPathMap.contest.doc(contestEntry.id))({
                    entries: fsFieldValue(FieldValue.increment(count)),
                }),
            Nothing: () =>
                transaction.set(FSPathMap.contest)({
                    id: "ee",
                    entries: count,
                    endDate: restaurant.contest.current.endDate,
                    user: user.id,
                }),
        })
        .update(FSPathMap.users.doc(user.id))({
            balance: user.balance - restaurant.contest.current.price * count,
        })
        .set(FSPathMap.transactions)({
        id: "",
        amount: -restaurant.contest.current.price * count,
        user: user.id,
        ref: "contest",
        plainRef: purchaseRef,
        type: "purchase",
        timestamp: serverTimestamp(),
    });

export const purchaseContestRoute = createAppRoute(
    onCallAppSignatures.purchaseContest,
    (uid) => ({ count }) =>
        fsGet({
            path: FSPathMap.contest,
            options: {
                where: [whereFactory("user", "==", uid)],
            },
        })
            .toMaybeAsync()
            .map((entries) => entries[0])
            .run()
            .then((safeContest) =>
                fsRunTransaction((transaction) =>
                    maybeAsyncAll(
                        transaction.get(FSPathMap.users.doc(uid)),
                        transaction.get(FSPathMap.restaurant)
                    )
                        .filter(
                            ([currentUser, restaurant]) =>
                                restaurant.contest.current.price * count <=
                                currentUser.balance
                        )
                        .extend(
                            tapMaybeAsync(
                                purchaseContestTransaction(
                                    transaction,
                                    safeContest,
                                    count
                                )
                            )
                        )
                        .run()
                )
            )
            .then(() => ({ message: "", status: true }))
            .catch(() => ({ message: "", status: false }))
);
