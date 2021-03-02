import * as admin from "firebase-admin";
admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export * from "./onCall";
export * from "./db";
export * from "./auth";
export * from "./cron";
