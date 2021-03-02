import * as _ from "lodash/fp";
import { Maybe } from "purify-ts";
import { fsInstance } from "../../../commonDefs/definitions";
import {
    FSCollectionPath,
    FSDocumentPath,
    FSPathType,
} from "../../types/firestore";
import { eitherToMaybe } from "../fp";
import {
    buildQuery,
    checkDocument,
    checkQuery,
    QueryOptions,
    QueryResult,
} from "./queries";

type FSCollectionListener<T> = QueryOptions & {
    path: FSCollectionPath<T>;
    callback: (data: QueryResult<T>) => void;
    options?: QueryOptions;
};

export const FSCollectionListener = <T>({
    path,
    callback,
    options,
}: FSCollectionListener<T>): (() => void) =>
    buildQuery({ path, ...options }).onSnapshot(
        _.flow(checkQuery(path.runtype), callback)
    );

interface FSDocumentListener<T> {
    path: FSDocumentPath<T>;
    callback: (data: Maybe<T>) => void;
}
export const FSDocumentListener = <T>({
    path,
    callback,
}: FSDocumentListener<T>): (() => void) =>
    fsInstance()
        .doc(path.path)
        .onSnapshot(
            _.flow(checkDocument(path.runtype), eitherToMaybe, callback)
        );

const isFSDocumentListener = <T>(
    props: FSDocumentListener<T> | FSCollectionListener<T>
): props is FSDocumentListener<T> => props.path.type === FSPathType.document;
export const fsListener = <T>(
    props: FSCollectionListener<T> | FSDocumentListener<T>
): (() => void) =>
    isFSDocumentListener(props)
        ? FSDocumentListener(props)
        : FSCollectionListener(props);
