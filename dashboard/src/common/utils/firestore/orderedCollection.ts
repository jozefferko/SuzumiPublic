import * as _ from "lodash/fp";
import { Maybe } from "purify-ts";
import {
    FSCollectionPath,
    FSDocumentPath,
    FSPathMap,
    FSPathType,
} from "../../types/firestore";
import { fsRunTransaction, FsTransaction } from "./FsTransaction";
import { generateFSId } from "./queries";

type FSDocument = {
    id: string;
};
type FSOrderCache = {
    orderedCollections: { [path: string]: string[] };
};
const cachePath: FSDocumentPath<FSOrderCache> = FSPathMap.cache;

const getCurrentPositions = <T extends FSDocument>(
    transaction: FsTransaction,
    path: FSCollectionPath<T>
) =>
    transaction
        .get(cachePath)
        .run()
        .then((cache) =>
            cache
                .chainNullable(
                    (safeCache) => safeCache.orderedCollections[path.path]
                )
                .orDefault([])
        );

export const appendOrderedDoc = <T extends FSDocument>(
    path: FSCollectionPath<T> | FSDocumentPath<T>,
    data: T
): Promise<boolean> =>
    path.type === FSPathType.collection
        ? appendOrderedDoc(path.doc(generateFSId()), data)
        : fsRunTransaction((transaction) =>
              getCurrentPositions(transaction, path.collection())
                  .then((currentPositions) =>
                      transaction.set(path)(data).update(cachePath)({
                          orderedCollections: {
                              [path.collection().path]: [
                                  path.id,
                                  ...currentPositions,
                              ],
                          },
                      })
                  )
                  .then(() => true)
          );

const defaultDeleteDoc = <A>(
    transaction: FsTransaction,
    path: FSDocumentPath<A>
): FsTransaction => transaction.delete(path);

export type OrderedDocDeleter<A> = (
    transaction: FsTransaction,
    path: FSDocumentPath<A>
) => FsTransaction;

export const deleteOrderedDoc = <T extends FSDocument>(
    path: FSDocumentPath<T>,
    deleteFunc: OrderedDocDeleter<T> = defaultDeleteDoc
): Promise<boolean> =>
    fsRunTransaction((transaction) =>
        getCurrentPositions(transaction, path.collection())
            .then((currentPositions) =>
                deleteFunc(transaction, path).update(cachePath)({
                    orderedCollections: {
                        [path.collection().path]: currentPositions.filter(
                            (id) => id !== path.id
                        ),
                    },
                })
            )
            .then(() => true)
    );

export const arrayMove = <T>(
    arr: T[],
    old_index: number,
    new_index: number
): T[] =>
    old_index < arr.length &&
    old_index >= 0 &&
    new_index < arr.length &&
    new_index >= 0
        ? _.flow(
              (array): T[] => [
                  ...array.slice(0, old_index),
                  ...array.slice(old_index + 1),
              ],
              (array): T[] => [
                  ...array.slice(0, new_index),
                  arr[old_index],
                  ...array.slice(new_index),
              ]
          )(arr)
        : arr;

export const moveOrderedDoc = <T extends FSDocument>(
    path: FSDocumentPath<T>,
    newIndex: number
) =>
    fsRunTransaction((transaction) =>
        getCurrentPositions(transaction, path.collection())
            .then((currentPositions) =>
                transaction.update(cachePath)({
                    orderedCollections: {
                        [path.collection().path]: arrayMove(
                            currentPositions,
                            currentPositions.indexOf(path.id),
                            newIndex
                        ),
                    },
                })
            )
            .then(() => true)
    );

export const getOrderedCollection = <T extends FSDocument>(
    path: FSCollectionPath<T>,
    docs: { [id: string]: T },
    cache: FSOrderCache
): T[] =>
    Maybe.mapMaybe(
        (id) => Maybe.fromNullable(docs[id]),
        cache.orderedCollections[path.path] || []
    );
