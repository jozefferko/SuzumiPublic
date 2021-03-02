import _ from "lodash/fp";
import { MaybeAsync } from "purify-ts";
import { Maybe } from "purify-ts/Maybe";
import { fsInstance, Transaction } from "../../../commonDefs/definitions";
import { FSDocumentPath, FSPath } from "../../types/firestore";
import { DeepPartial, wID } from "../../types/misc";
import { deNormalize, dotAnnotate } from "./normalize";
import { checkDocument, docRef } from "./queries";

export type FsTransaction = {
    set: <T extends wID>(path: FSPath<T>) => (data: T) => FsTransaction;
    update: <T>(
        path: FSDocumentPath<T>
    ) => (data: DeepPartial<T>) => FsTransaction;
    delete: <T>(path: FSDocumentPath<T>) => FsTransaction;
    get: <T>(path: FSDocumentPath<T>) => MaybeAsync<T>;
    exists: <T>(path: FSDocumentPath<T>) => MaybeAsync<boolean>;
};

export const fsTransactionFactory = (
    transaction: Transaction
): FsTransaction => ({
    set: (path) => (data) =>
        fsTransactionFactory(transaction.set(docRef(path), deNormalize(data))),
    update: (path) => (data) =>
        fsTransactionFactory(
            path.id !== ""
                ? transaction.update(
                      docRef(path),
                      _.flow(dotAnnotate, deNormalize)(data)
                  )
                : transaction
        ),
    delete: (path) => fsTransactionFactory(transaction.delete(docRef(path))),
    get: (path) =>
        MaybeAsync.fromPromise(
            () =>
                transaction
                    .get(docRef(path))
                    .then((doc) => checkDocument(path.runtype)(doc).toMaybe())
            // .then(eitherToMaybe),
        ),
    exists: (path) =>
        MaybeAsync.fromPromise(() =>
            transaction.get(docRef(path)).then((doc) => Maybe.of(doc.exists))
        ),
});

export const fsRunTransaction = <T>(
    fn: (transaction: FsTransaction) => Promise<T>
): Promise<T> =>
    fsInstance().runTransaction((t: Transaction) =>
        fn(fsTransactionFactory(t))
    );
