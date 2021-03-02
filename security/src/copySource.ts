import * as fs from "fs";

// const startString = "//AUTO_COPY";

const pathToSource = "../functions/src/types/firestore.ts";
const pathToTarget = "./src/source.ts";
const pathToTemplate = "./src/sourceTemplate.ts";

const template = fs.readFileSync(pathToTemplate).toString();

const source = fs.readFileSync(pathToSource).toString();
const FSExports = source.substring(source.indexOf("export const FS"));

const generated = template + FSExports;
//generate new
fs.writeFileSync(pathToTarget, generated);
console.log("source created");
