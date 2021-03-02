import _ from "lodash/fp";
import { Either, Left, Right } from "purify-ts";
import { Maybe } from "purify-ts/Maybe";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Static } from "runtypes";
import { FSCollectionPath, FSSearchIndex } from "../common/types/firestore";
import { Dictionary } from "../common/types/misc";
import { fsListener } from "../common/utils/firestore/listeners";
import { dictionarify } from "../common/utils/firestore/normalize";
import {
    orderByParams,
    whereFactory,
    WhereParams,
} from "../common/utils/firestore/queries";
import { fMap } from "../common/utils/fp";

enum Status {
    loading,
    completed,
    failed,
}
// type Di<A> = {
//     [id: string]: A;
// };

const getSearchIndexes = () => Object.keys(FSSearchIndex.fields);
const emptyResults = <A>(): Dictionary<A> => ({});
const emptyStatus = (): Dictionary<Status> =>
    getSearchIndexes().reduce(
        (acc, index) => ({ ...acc, [index]: Status.loading }),
        {}
    ) as Dictionary<Status>;

const safeResult = <A>(
    results: Dictionary<Dictionary<A>>,
    status: Status[]
): Either<Status.failed, Dictionary<A>> =>
    status.includes(Status.failed)
        ? Left(Status.failed)
        : Right(
              Object.values(results).reduce(
                  (acc: Dictionary<A>, val) => ({ ...acc, ...val }),
                  {}
              )
          );

interface SearchableDocument {
    id: string;
    searchIndex: Static<typeof FSSearchIndex>;
}

export type SearchSortingOption<A> = {
    comparator: (a: A, b: A) => number;
    orderBy: orderByParams;
};
// const defaultOrderBy:OrderBy<SearchableDocument> = {
//     comparator:((a, b) => (a>b)?-1:(a<b)?1:0)
//     order: orderByFactory()
// }

const trimArray = <T>(length: number) => (arr: T[]): T[] =>
    arr.filter((item, index) => index < length);
const keywordArray = _.flow(
    _.toLower,
    _.trim,
    _.split(" "),
    trimArray(10),
    fMap(_.trim)
);

export const useSearch = <A extends SearchableDocument>(
    path: FSCollectionPath<A>,
    keyword: string,
    pageSize: number,
    orderBy: SearchSortingOption<A>,
    where: WhereParams[] = []
): Either<Status.failed, A[]> => {
    // const [query, querySetter] = useState<Maybe<string>>(Maybe.empty());
    // const [currentOrderBy, setOrderBy] = useState<OrderBy<A>>(defaultOrderBy);

    const [status, statusSetter] = useState<Dictionary<Status>>(emptyStatus());
    const [results, resultsSetter] = useState<Dictionary<Dictionary<A>>>(
        emptyResults()
    );
    const callback = useCallback(
        (index: string) => (safedata: Maybe<A[]>) =>
            safedata
                .ifJust((data) =>
                    resultsSetter((state) => ({
                        ...state,
                        [index]: dictionarify(data),
                    }))
                )
                .ifJust(() =>
                    statusSetter((state) => ({
                        ...state,
                        [index]: Status.completed,
                    }))
                )
                .ifNothing(() =>
                    statusSetter((state) => ({
                        ...state,
                        [index]: Status.failed,
                    }))
                ),
        []
    );

    useEffect(() => {
        statusSetter(emptyStatus());
        if (keyword.trim().length <= 0) {
            return fsListener({
                path: path,
                options: {
                    where,
                    orderBy: [orderBy.orderBy],
                    pagination: {
                        pageSize: pageSize,
                        page: 0,
                    },
                },
                callback: callback(getSearchIndexes()[0]),
            });
        }
        const unsubs = getSearchIndexes().map((index) =>
            fsListener({
                path: path,
                options: {
                    where: [
                        ...where,
                        whereFactory(
                            `searchIndex.${index}`,
                            "in",
                            keywordArray(keyword)
                        ),
                    ],
                    orderBy: [orderBy.orderBy],
                    pagination: {
                        pageSize: pageSize,
                        page: 0,
                    },
                },
                callback: callback(index),
            })
        );
        return () => unsubs.forEach((unsub) => unsub());
    }, [path, keyword, pageSize, orderBy, callback, where]);

    useEffect(() => {
        return () => {
            resultsSetter(emptyResults());
        };
    }, [path, keyword, orderBy]);

    return useMemo(
        () =>
            safeResult<A>(results, Object.values(status))
                .map(Object.values)
                .map(($) => $.sort(orderBy.comparator)),
        [orderBy, results, status]
    );
};
