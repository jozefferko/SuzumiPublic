import * as _ from "lodash/fp";
import { Maybe, MaybeAsync } from "purify-ts";
import {
    FSCollectionPath,
    FSDocumentPath,
    FSPathMap,
} from "../../types/firestore";
import { functionLogger, nothingLog } from "../fp";
import {
    fsRunTransaction,
    FsTransaction as FSTransaction,
} from "./fsTransaction";
import { generateFSId } from "./queries";

interface FSLinkListItem {
    id: string;
    position: {
        next: string;
        prev: string;
    };
}

interface FSLinkListCache {
    linkListFirstIds: { [path: string]: string };
}

const cachePath: FSDocumentPath<FSLinkListCache> = FSPathMap.cache;
const isLast = <T extends FSLinkListItem>(item: T): boolean =>
    item.position.next === "";

const findLastLink = <T extends FSLinkListItem>(dic: {
    [i: string]: T;
}): Maybe<T> => Maybe.fromNullable(Object.values(dic).find(isLast));

const positionProperty = <T extends FSLinkListItem>(
    item: T,
    next: boolean = false
): string => (next ? item.position.next : item.position.prev);

const createLinkList = <T extends FSLinkListItem>(
    transaction: FSTransaction,
    path: FSDocumentPath<T>,
    data: T
) =>
    transaction
        .set(path)({
            ...data,
            position: { prev: "", next: "" },
        })
        .update(cachePath)({
        linkListFirstIds: { [path.collection().path]: path.id },
    });

const appendLink = <T extends FSLinkListItem>(
    transaction: FSTransaction,
    path: FSDocumentPath<T>,
    data: T
) => (prevId: string) =>
    transaction
        .set(path)({
            ...data,
            position: { prev: prevId, next: "" },
        })
        .update(path.collection().doc(prevId))({
        position: { next: path.id },
    });

export const fsLinkListAdd = <T extends FSLinkListItem>(
    currentSnapshot: { [i: string]: T },
    path: FSCollectionPath<T>,
    data: T
): Promise<any> =>
    fsRunTransaction((transaction) =>
        transaction
            .get(cachePath)
            .chain(
                (cache): MaybeAsync<T> =>
                    cache.linkListFirstIds[path.path]
                        ? MaybeAsync.liftMaybe(
                              findLastLink(currentSnapshot)
                                  .map(idProperty)
                                  .map(path.doc)
                          ).chain(transaction.get)
                        : MaybeAsync.liftMaybe<T>(
                              Maybe.empty().ifNothing(() =>
                                  createLinkList(
                                      transaction,
                                      path.doc(generateFSId()),
                                      data
                                  )
                              )
                          )
            )
            .run()
            .then((safeLastDoc) =>
                safeLastDoc
                    .chain(Maybe.fromPredicate(isLast))
                    .ifJust(
                        _.flow(
                            idProperty,
                            appendLink(
                                transaction,
                                path.doc(generateFSId()),
                                data
                            )
                        )
                    )
            )
    );

const mergeLinks = <T extends FSLinkListItem>(
    transaction: FSTransaction,
    path: FSCollectionPath<T>,
    prev: string,
    next: string
): FSTransaction =>
    transaction
        .update(path.doc(prev))({
            position: { next },
        })
        .update(path.doc(next))({
        position: { prev },
    });

const updateCache = <T extends FSLinkListItem>(
    cache: FSLinkListCache,
    path: FSCollectionPath<T>,
    doc: T
) => (transaction: FSTransaction): FSTransaction =>
    cache.linkListFirstIds[path.path] === doc.id
        ? transaction.update(cachePath)({
              linkListFirstIds: {
                  [path.path]: doc.position.prev || doc.position.next,
              },
          })
        : transaction;

const deleteLink = <T extends FSLinkListItem>(
    transaction: FSTransaction,
    path: FSDocumentPath<T>,
    cache: FSLinkListCache
) => (doc: T): FSTransaction =>
    _.flow(
        mergeLinks(
            transaction,
            path.collection(),
            doc.position.prev,
            doc.position.next
        ).delete,
        updateCache(cache, path.collection(), doc)
    )(path);

export const fsLinkListDelete = <T extends FSLinkListItem>(
    path: FSDocumentPath<T>
): Promise<any> =>
    fsRunTransaction((transaction) =>
        transaction
            .get(cachePath)
            .chain((cache) =>
                transaction.get(path).map(deleteLink(transaction, path, cache))
            )
            .run()
    );
const idProperty = <T extends { id: string }>(v: T): string => v.id;
export const fsLinkListMove = <T extends FSLinkListItem>(
    currentSnapshot: { [i: string]: T },
    path: FSDocumentPath<T>,
    next: string
): Promise<any> =>
    fsRunTransaction((transaction) =>
        transaction
            .get(path)
            .chain((doc) =>
                MaybeAsync.liftMaybe(
                    Maybe.fromPredicate(
                        (d) => !!(d.position.prev && d.position.next),
                        doc
                    )
                )
            )
            .chain((doc) =>
                MaybeAsync.fromPromise(() =>
                    transaction
                        .get<T>(path.collection().doc(next))

                        .run()
                        .then(
                            async (a): Promise<Maybe<string>> =>
                                a
                                    .map(positionProperty)
                                    .ifNothing(nothingLog("cant move"))
                                    .alt(
                                        await MaybeAsync.liftMaybe<T>(
                                            findLastLink(currentSnapshot)
                                        )
                                            .chain(
                                                _.pipe(
                                                    idProperty,
                                                    path.collection().doc,
                                                    transaction.get
                                                )
                                            )
                                            .chain((nextDoc) =>
                                                MaybeAsync.liftMaybe(
                                                    Maybe.fromPredicate(
                                                        isLast,
                                                        nextDoc
                                                    )
                                                )
                                            )
                                            .map(idProperty)
                                            .run()
                                    )
                        )
                ).map(
                    functionLogger((prev) =>
                        mergeLinks(
                            transaction,
                            path.collection(),
                            doc.position.prev,
                            doc.position.next
                        )
                            .update(path.collection().doc(prev))({
                                position: { next: doc.id },
                            })
                            .update(path.collection().doc(next))({
                                position: { prev: doc.id },
                            })
                            .update(path)({
                            position: { prev, next },
                        })
                    )
                )
            )
            .run()
    );

const connecLink = <T extends FSLinkListItem>(
    dic: { [id: string]: T },
    id: string,
    next: boolean = false
): T[] =>
    id === ""
        ? []
        : next
        ? [dic[id], ...connecLink(dic, dic[id].position.next, next)]
        : [...connecLink(dic, dic[id].position.prev, next), dic[id]];

export const linkListToArray = <T extends FSLinkListItem>(
    dic: {
        [id: string]: T;
    },
    startId: string = ""
): T[] =>
    Object.values(dic).length < 1
        ? []
        : startId
        ? [
              ...connecLink(dic, dic[startId].position.prev),
              dic[startId],
              ...connecLink(dic, dic[startId].position.next, true),
          ]
        : linkListToArray(dic, Object.values(dic)[0].id);
