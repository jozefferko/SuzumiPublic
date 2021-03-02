import * as fs from "fs";
import { FSPathMap } from "./source";
import { conf, FSPath, Number, Record, Timestamp } from "./converter";
import _ from "lodash/fp";
import { Maybe } from "purify-ts";

const startString = "//AUTO_RULES";
// const endString = "//AUTO_RULES_END";

const rulesPath = "./firestore.rules";
// const backupRulesPath = "./firestore.backup.rules";

const ending = "\n    }\n}";
// const pad = "\n        ";
const existingRules = fs.readFileSync(rulesPath).toString();
// fs.writeFileSync(backupRulesPath, existingRules);

//generate new
const clearedRules: string = existingRules.substring(
    0,
    existingRules.indexOf(startString) + startString.length
);
//filter new based on whether they are used
type Result = {
    helpers: string[];
    funcs: string[];
};
const schemaHeader = (path: string) => (condition: string) => `\nfunction ${
    conf.prefix
}${path.replace("/", "_")}() {
        return ${condition}; \n}`;

const headerName = (path: string) => `${conf.prefix}${path.replace("/", "_")}`;
const helperHeader = (condition: string, index: number) =>
    `\nfunction ${conf.helperPrefix}${index}(r) {${condition}; \n}`;

const fstimestamp = Record({
    seconds: Number,
    nanoseconds: Number,
});
const nativeTimestamp = (r: Result): Result =>
    Maybe.of(fstimestamp.def("r")([]).helpers[0])
        .map(($) => r.helpers.indexOf($))
        .filter((index) => index > -1)
        .map(($) =>
            r.helpers.map((v, i) =>
                i === $ ? "\n return " + Timestamp.def("r")([]).condition : v
            )
        )
        .mapOrDefault<Result>((helpers) => ({ ...r, helpers }), r);

const joinResult = (r: Result) =>
    r.funcs.join("\n") + r.helpers.map(helperHeader).join("\n");
const result = _.flow(
    Object.values,
    _.reduce(
        (acc: Result, path: FSPath) => {
            const schema = path.runtype.def("request.resource.data")(
                acc.helpers
            );
            return clearedRules.includes(headerName(path.path))
                ? {
                      helpers: schema.helpers,
                      funcs: [
                          ...acc.funcs,
                          schemaHeader(path.path)(schema.condition),
                      ],
                  }
                : acc;
        },
        { helpers: [], funcs: [] }
    ),
    nativeTimestamp,
    joinResult
)(FSPathMap);

//remove previously generated

const final = clearedRules + result + ending;

fs.writeFileSync(rulesPath, final);
