import _ from "lodash/fp";

export const conf = {
    prefix: "schema_",
    helperPrefix: "helper_",
    arr: { limit: 10, strict: true },
};

type Result = {
    condition: string;
    helpers: string[];
};

type Def = (prop: string) => (helpers: string[]) => Result;

export type Runtype = {
    Or: (b: Runtype) => Runtype;
    And: (b: Runtype) => Runtype;
    def: Def;
};

export type FSPath = {
    runtype: Runtype;
    path: string;
};

export type Static<T> = any;

export const FSCollectionPath = (runtype: Runtype, path: string): FSPath => ({
    runtype,
    path,
});

export const FSDocumentPath = (runtype: Runtype, path: string): FSPath => ({
    runtype,
    path,
});

const helperCall = (index: number, prop: string) =>
    `${conf.helperPrefix}${index}(${prop})`;

const conditionalDef = (or: boolean) => (a: Def) => (b: Runtype): Def => (
    prop: string
) => (helpers: string[]) => {
    const aResult = a("r")(helpers);
    const bResult = b.def("r")(aResult.helpers);
    const body: Result = {
        condition: `\nreturn ${aResult.condition} ${or ? "||" : "&&"} ${
            bResult.condition
        }`,
        helpers: bResult.helpers,
    };
    return addHelper(prop)(helpers)(body);
};

const andDef = conditionalDef(false);
const orDef = conditionalDef(true);
const createRuntype = (def: Def): Runtype => ({
    And: _.flow(andDef(def), createRuntype),
    Or: _.flow(orDef(def), createRuntype),
    def: def,
});

const isDef = (type: string): Def => (prop: string) => (helpers: string[]) => ({
    condition: `${prop} is ${type}`,
    helpers,
});

const customDef = (funcName: string): Def => (prop: string) => (
    helpers: string[]
) => ({
    condition: `${funcName}(${prop})`,
    helpers,
});

const excludeId = (keys: string[]) => keys.filter((key) => key !== "id");

const arrayReducer = (inline: string) => (acc: string, val: number) =>
    `${acc}\n    && (size < ${val + 1} || ${inline})`.replace(
        "ARRAYINDEX",
        `r[${val}]`
    );

const dictionaryReducer = (inline: string) => (acc: string, val: number) =>
    `${acc}\n      && (size < ${val + 1} || ${inline})`.replace(
        "ARRAYINDEX",
        `values[${val}]`
    );
const arrayHeader = `\nlet size = r.size();\n    return r is list`;
const dictionaryHeader =
    `\n    let size = r.values().size();\n    let values = r.values();` +
    `\n    return r is map`;
const createArrayResult = (dictionary: boolean) => (
    result: Result
): Result => ({
    condition: _.range(0, conf.arr.limit).reduce(
        (dictionary ? dictionaryReducer : arrayReducer)(result.condition),
        dictionary ? dictionaryHeader : arrayHeader
    ),
    helpers: result.helpers,
});
const addHelper = (prop: string) => (helpers: string[]) => (body: Result) =>
    helpers.includes(body.condition)
        ? {
              condition: helperCall(helpers.indexOf(body.condition), prop),
              helpers,
          }
        : {
              condition: helperCall(body.helpers.length, prop),
              helpers: [...body.helpers, body.condition],
          };
export const arrayDef = (dictionary: boolean) => (of: Runtype): Def => (
    prop: string
) => (helpers: string[]) =>
    _.flow(
        of.def("ARRAYINDEX"),
        createArrayResult(dictionary),
        addHelper(prop)(helpers)
    )(helpers);
const appendResult = (partial: boolean) => (key: string) => (
    acc: string,
    result: Result
): Result => ({
    condition: `${acc}\n    ${partial ? `&& (!("${key}" in keys) ||` : "&&"} ${
        result.condition
    }${partial ? ")" : ""}`,
    helpers: result.helpers,
});
const dicDef = (partial: boolean) => (record: {
    [id: string]: Runtype;
}): Def => (prop: string) => (helpers: string[]) => {
    const keys = excludeId(Object.keys(record));
    const body = keys.reduce(
        (acc: Result, key) =>
            appendResult(partial)(key)(
                acc.condition,
                record[key].def(`r["${key}"]`)(acc.helpers)
            ),
        {
            condition: `\nlet keys = r.keys();\n return ${
                partial ? "r is map" : `keys.hasAll(["${keys.join(`","`)}"])`
            }`,
            helpers,
        }
    );
    return addHelper(prop)(helpers)(body);
};

export const literalDef = (lit: string | boolean | number) => (
    prop: string
) => (helpers: string[]) => ({
    condition: `${prop} == ${typeof lit === "string" ? `"${lit}"` : lit}`,
    helpers,
});

const appendUnion = (acc: string, result: Result, i: number): Result => ({
    condition: `${acc} ${i > 0 ? "\n   ||" : ""}${result.condition}`,
    helpers: result.helpers,
});
export const unionDef = (...args: Runtype[]): Def => (prop: string) => (
    helpers: string[]
) =>
    addHelper(prop)(helpers)(
        args.reduce(
            (acc: Result, val, i) =>
                appendUnion(acc.condition, val.def("r")(acc.helpers), i),
            { condition: "\n  return ", helpers: helpers }
        )
    );

export const Literal = _.flow(literalDef, createRuntype);
export const Union = _.flow(unionDef, createRuntype);
const customRuntype = _.flow(customDef, createRuntype);
export const I0p: Runtype = customRuntype("I0p");
export const Year: Runtype = customRuntype("Year");
export const Month: Runtype = customRuntype("Month");
export const Day: Runtype = customRuntype("Day");
export const Ip: Runtype = customRuntype("Ip");
export const I: Runtype = customRuntype("I");
export const Index: Runtype = customRuntype("Index");
export const F0p: Runtype = customRuntype("F0p");
export const Nully: Runtype = customRuntype("Nully");

const isRuntype = _.flow(isDef, createRuntype);
export const Timestamp: Runtype = isRuntype("timestamp");
export const Boolean: Runtype = isRuntype("bool");
export const Number: Runtype = isRuntype("number");
export const String: Runtype = isRuntype("string");

export const Array = _.flow(arrayDef(false), createRuntype);
export const Dictionary = _.flow(arrayDef(true), createRuntype);
export const Record = _.flow(dicDef(false), createRuntype);
export const Partial = _.flow(dicDef(true), createRuntype);
