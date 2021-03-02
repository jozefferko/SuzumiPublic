import * as functions from "firebase-functions";
import { FSCounter, FSPathMap } from "../../common/types/firestore";
import { Maybe } from "purify-ts";
import { fsRunTransaction } from "../../common/utils/firestore/fsTransaction";
import { FieldValue } from "../../commonDefs/definitions";
import {
    checkDocument,
    fsFieldValue,
} from "../../common/utils/firestore/queries";
import _ from "lodash/fp";
import { ifJustMaybe } from "../../common/utils/fp";

export const usersCounterIncrement = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.users.path}/{userId}`)
    .onCreate((change) => counterOperation(FSPathMap.users.path, change.id));

// export const usersCounterDecrement = functions
//     .region("europe-west3")
//     .firestore.document(`${FSPathMap.users.path}/{userId}`)
//     .onDelete((change) =>
//         counterOperation(FSPathMap.users.path, change.id, false)
//     );

export const counterOperation = (
    key: string,
    idempotentKey: string,
    increment = true,
    amount: number = 1
) =>
    fsRunTransaction((transaction) =>
        transaction
            .get(FSPathMap.stats)
            .run()
            .then((safeStats) =>
                safeStats
                    .chainNullable((stats) => stats.counters[key])
                    .caseOf<any>({
                        Just: _.flow(
                            Maybe.fromPredicate<FSCounter>(
                                (userCounter) =>
                                    userCounter.lastIdempotentKey !==
                                    idempotentKey
                            ),
                            ifJustMaybe(() =>
                                transaction.update(FSPathMap.stats)({
                                    counters: {
                                        [key]: {
                                            lastIdempotentKey: idempotentKey,
                                            count: fsFieldValue(
                                                FieldValue.increment(
                                                    increment ? amount : -amount
                                                )
                                            ),
                                        },
                                    },
                                })
                            )
                        ),
                        Nothing: () =>
                            transaction.update(FSPathMap.stats)({
                                counters: {
                                    [key]: {
                                        lastIdempotentKey: idempotentKey,
                                        count: 1,
                                    },
                                },
                            }),
                    })
            )
    );

export const contestCreateIncrement = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.contest.path}/{contestId}`)
    .onCreate((change, event) =>
        counterOperation(FSPathMap.contest.path, event.eventId)
    );

export const contestUpdateIncrement = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.contest.path}/{contestId}`)
    .onUpdate((change, event) =>
        counterOperation(FSPathMap.contest.path, event.eventId)
    );

// const productCounterOperation = (
//     key: string,
//     idempotentKey: string,
//     points: number
// ) =>
//     fsRunTransaction((transaction) =>
//         transaction
//             .get(FSPathMap.stats)
//             .run()
//             .then((safeStats) =>
//                 safeStats
//                     .chainNullable((stats) => stats.counters[key])
//                     .caseOf<any>({
//                         Just: _.flow(
//                             Maybe.fromPredicate<FSCounter>(
//                                 (userCounter) =>
//                                     userCounter.lastIdempotentKey !==
//                                     idempotentKey
//                             ),
//                             ifJustMaybe(() =>
//                                 transaction.update(FSPathMap.stats)({
//                                     products: {
//                                         [key]: {
//                                             lastIdempotentKey: idempotentKey,
//                                             count: fsFieldValue(
//                                                 FieldValue.increment(1)
//                                             ),
//                                             points: fsFieldValue(
//                                                 FieldValue.increment(points)
//                                             ),
//                                         },
//                                     },
//                                 })
//                             )
//                         ),
//                         Nothing: () =>
//                             transaction.update(FSPathMap.stats)({
//                                 products: {
//                                     [key]: {
//                                         lastIdempotentKey: idempotentKey,
//                                         count: 1,
//                                         points: points,
//                                     },
//                                 },
//                             }),
//                     })
//             )
//     );
export const purchasedProductIncrement = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.purchases.path}/{purchaseId}`)
    .onCreate((change, event) =>
        checkDocument(FSPathMap.purchases.runtype)(change)
            .toMaybe()
            .mapOrDefault(
                (purchase) => counterOperation(purchase.product, event.eventId),
                null
            )
    );

// MaybeAsync.liftMaybe(
//     checkDocument(FSPathMap.articles.runtype)(change.before)
//         .chain(Maybe.fromPredicate((b) => !b.isPublished))
//         .chain(() =>
//             checkDocument(FSPathMap.articles.runtype)(change.after)
//         )
//         .chain(Maybe.fromPredicate((b) => b.isPublished))
// )
//     .chain((after) =>
//         MaybeAsync.liftPromise(() =>
//             broadcastNotification({
//                 en: { body: after.text, title: after.title },
//                 dk: { body: after.text, title: after.title },
//             })
//         )
//     )
//     .run()
