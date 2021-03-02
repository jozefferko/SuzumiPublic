import _ from "lodash/fp";
import { Either, EitherAsync, Left, MaybeAsync } from "purify-ts";
import { fsInstance } from "../../../commonDefs/definitions";
import {
    FSCollectionPath,
    FSDocumentPath,
    FSPathType,
} from "../../types/firestore";
import {
    buildQuery,
    checkDocument,
    checkQuery,
    FsError,
    QueryOptions,
} from "./queries";

type FSCollectionGetter<T> = QueryOptions & {
    path: FSCollectionPath<T>;
    options?: QueryOptions;
};

export const fsCollectionGetter = <T>({
    path,
    options,
}: FSCollectionGetter<T>): EitherAsync<FsError, T[]> =>
    MaybeAsync.fromPromise(() =>
        buildQuery({ path, ...options })
            .get()
            .then(checkQuery(path.runtype))
    ).toEitherAsync("fsError");

interface FSDocumentGetter<T> {
    path: FSDocumentPath<T>;
}
export const fsDocumentGetter = <T>({
    path,
}: FSDocumentGetter<T>): EitherAsync<FsError, T> =>
    EitherAsync.fromPromise(() =>
        fsInstance()
            .doc(path.path)
            .get()
            .then(checkDocument(path.runtype))
            .catch(
                _.flow<any, FsError, Either<FsError, T>>(
                    _.always("fsError"),
                    Left
                )
            )
    );

const isFSDocumentGetter = <T>(
    props: FSDocumentGetter<T> | FSCollectionGetter<T>
): props is FSDocumentGetter<T> => props.path.type === FSPathType.document;

type FSGet = {
    <A>(a: FSCollectionGetter<A>): EitherAsync<FsError, A[]>;
    <A>(a: FSDocumentGetter<A>): EitherAsync<FsError, A>;
};
export const fsGet: FSGet = (props: any): any =>
    isFSDocumentGetter(props)
        ? fsDocumentGetter(props)
        : fsCollectionGetter(props);
