import { parsePhoneNumber } from "libphonenumber-js";
import _ from "lodash/fp";
import { Maybe } from "purify-ts";
import { FSSearchIndex, FSUser } from "../types/firestore";
import { fromThrowableC } from "./fp";

const getSearchIndexes = () => Object.keys(FSSearchIndex.fields);

export const stubSearchIndex = (): FSSearchIndex =>
    getSearchIndexes().reduce(
        (acc, index) => ({
            ...acc,
            [index]: "",
        }),
        {}
    ) as FSSearchIndex;

export const userSearchIndexBuilder = (user: FSUser): FSSearchIndex => ({
    ...stubSearchIndex(),
    [getSearchIndexes()[0]]: user.email,
    [getSearchIndexes()[1]]: Maybe.fromPredicate(
        (a: string) => a.includes("@"),
        user.email
    ).mapOrDefault((m) => m.split("@")[0], ""),
    [getSearchIndexes()[2]]: user.phoneNumber,
    ...fromThrowableC(parsePhoneNumber)(user.phoneNumber)
        .map(($) => ({
            [getSearchIndexes()[3]]: `+${$.countryCallingCode}`,
            [getSearchIndexes()[4]]: `${$.nationalNumber}`,
        }))
        .orDefault({
            [getSearchIndexes()[3]]: "",
            [getSearchIndexes()[4]]: "",
        }),

    ...getSearchIndexes()
        .slice(5)
        .reduce(
            (acc, searchIndex, index) => ({
                ...acc,
                [searchIndex]: Maybe.fromNullable(
                    user.displayName.split(" ")[index]
                )
                    .map(_.lowerCase)
                    .orDefault(""),
            }),
            {}
        ),
});
export const searchIndexUser = (user: FSUser): FSUser => ({
    ...user,
    searchIndex: userSearchIndexBuilder(user),
});
