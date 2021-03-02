import _ from "lodash/fp";
import { Either, Maybe } from "purify-ts";
import { Runtype } from "runtypes";
import {
    CollectionReference,
    DocumentReference,
    DocumentSnapshot,
    FieldValue,
    fsInstance,
    OrderByDirection,
    Query,
    QuerySnapshot,
    WhereFilterOp,
    WriteResult,
} from "../../../commonDefs/definitions";
import {
    FSCollectionPath,
    FSDocumentPath,
    FSPath,
    FSPathType,
    FSTimestamp,
} from "../../types/firestore";
import { DeepPartial } from "../../types/misc";
import { fromThrowableC, reduceC } from "../fp";
import {
    deNormalize,
    deSerializeTimestamp,
    dotAnnotate,
    extractFSDoc,
    extractFSQuery,
} from "./normalize";

export interface WhereParams {
    field: string;
    opStr: WhereFilterOp;
    value: any;
}
export const whereFactory = (
    field: string,
    opStr: WhereFilterOp,
    value: any
): WhereParams => ({
    field,
    opStr,
    value,
});

export interface OrderByParams {
    field: string;
    direction: OrderByDirection;
}
export const orderByFactory = (
    field: string,
    direction: OrderByDirection
): OrderByParams => ({
    field,
    direction,
});

export type PaginationParams = { page?: number; pageSize: number };

export type QueryOptions = {
    where?: WhereParams[];
    orderBy?: OrderByParams[];
    pagination?: PaginationParams;
};

type CreateQuery<T> = QueryOptions & {
    path: FSCollectionPath<T>;
};

const queryBound = (query: string) => {
    const strSearch = query;
    const strlength = strSearch.length;
    const strFrontCode = strSearch.slice(0, strlength - 1);
    const strEndCode = strSearch.slice(strlength - 1, strSearch.length);

    return strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
};

export const whereStartsWith = (
    field: string,
    value: string
): WhereParams[] => [
    whereFactory(field, ">=", value),
    whereFactory(field, "<", queryBound(value)),
];
export type FsError = "fsError" | "empty" | "typeError";

export enum fsUploadType {
    set,
    merge,
    update,
}

interface fsUploadNew<T> {
    path: FSCollectionPath<T>;
    type: fsUploadType.set;
    data: T;
}

interface fsUploadSet<T> {
    path: FSDocumentPath<T>;
    type: fsUploadType;
    data: T;
}
interface fsUploadUpdate<T> {
    path: FSDocumentPath<T>;
    type: fsUploadType.update;
    data: DeepPartial<T>;
}

type fsUpload<T> = fsUploadUpdate<T> | fsUploadSet<T> | fsUploadNew<T>;

const set = (merge: boolean, data: any) => (ref: DocumentReference) =>
    ref.set(deNormalize(data), { merge });

const update = (data: any) => (ref: DocumentReference) =>
    ref.update(_.flow(dotAnnotate, deNormalize)(data));

export const fsUpload = <T>({
    type,
    path,
    data,
}: fsUpload<T>): Promise<WriteResult> =>
    (type === fsUploadType.update
        ? update(data)
        : set(type === fsUploadType.merge, data))(docRef(path));

export const fsDelete = <T>(path: FSDocumentPath<T>): Promise<WriteResult> =>
    docRef(path).delete();

// fsUpload<OmitId<typeof FSProduct>>({
//     path: FSPathMap.products.doc("ee"),
//     type: fsUploadType.update,
//     data: { displayName: "a" },
// });

export const docRef = <A>(path: FSPath<A>): DocumentReference =>
    path.type === FSPathType.document
        ? fsInstance().doc(path.path)
        : fsInstance().collection(path.path).doc();
export const collectionRef = <A>(
    path: FSCollectionPath<A>
): CollectionReference => fsInstance().collection(path.path);

const emptyQueryPredicate = (snapshot: QuerySnapshot): boolean =>
    !snapshot.empty;
export type QueryResult<T> = Maybe<T[]>;
export const checkQuery = <T>(runtype: Runtype<T>) => (
    snapshot: QuerySnapshot
): QueryResult<T> =>
    Maybe.fromNullable(snapshot)
        .filter(emptyQueryPredicate)
        .map(extractFSQuery)
        .alt(Maybe.of([]))
        .chain(fromThrowableC(_.map(runtype.check)));

export const documentExistsPredicate = (snapshot: DocumentSnapshot) =>
    snapshot.exists;

export const checkDocument = <T>(runtype: Runtype<T>) => (
    snapshot: DocumentSnapshot
): Either<FsError, T> =>
    Maybe.fromNullable(snapshot)
        .filter(documentExistsPredicate)
        .toEither<FsError>("empty")
        .map(extractFSDoc)
        .chain((doc) =>
            fromThrowableC(runtype.check)(doc).toEither("typeError")
        );

const whereChain = (acc: Query, params: WhereParams): Query =>
    acc.where(
        params.field,
        params.opStr,
        FSTimestamp.guard(params.value)
            ? deSerializeTimestamp(params.value)
            : params.value
    );

const orderByChain = (acc: Query, params: OrderByParams): Query =>
    acc.orderBy(params.field, params.direction);

const setOffset = (pagination: PaginationParams) => (query: Query): Query =>
    query.offset
        ? query.offset(
              pagination.pageSize *
                  (Maybe.fromNullable(pagination.page)
                      .chain(Maybe.fromPredicate((num) => num >= 1))
                      .orDefault(1) -
                      1)
          )
        : query;

const paginate = (pagination: PaginationParams | undefined) => (
    query: Query
): Query =>
    pagination
        ? setOffset(pagination)(query).limit(pagination.pageSize)
        : query;

export const buildQuery = <T>({
    path,
    where,
    orderBy,
    pagination,
}: CreateQuery<T>): Query =>
    _.flow(
        paginate(pagination),
        reduceC(orderByChain)(orderBy || []),
        reduceC(whereChain)(where || [])
    )(collectionRef(path));
export const generateFSId = (): string =>
    fsInstance().collection("stub").doc().id;

export type FsFieldValue = {
    type: "fieldvalue";
    value: FieldValue;
};

export const fsFieldValue = (val: FieldValue): FsFieldValue => ({
    type: "fieldvalue",
    value: val,
});
