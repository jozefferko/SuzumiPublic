import * as functions from "firebase-functions";
import {
    fsFieldValue,
    fsUpload,
    fsUploadType,
} from "../common/utils/firestore/queries";
import { FSPathMap, FSRoles } from "../common/types/firestore";
import * as admin from "firebase-admin";
import { FieldValue } from "../commonDefs/definitions";
import { counterOperation } from "./db";
export const deletedUserCleanup = functions
    .region("europe-west3")
    .auth.user()
    .onDelete(async (u, change) => {
        console.log("deleted", u.uid);
        await admin
            .storage()
            .bucket()
            .deleteFiles({ prefix: `profileImages/${u.uid}` });

        await fsUpload({
            path: FSPathMap.users.doc(u.uid),
            type: fsUploadType.update,
            data: {
                flags: fsFieldValue(FieldValue.arrayRemove("active")),
                displayName: "",
                email: "",
                birthday: fsFieldValue(FieldValue.delete()),
                photoUrl: "",
                phoneNumber: "",
            },
        });
        await counterOperation(FSPathMap.users.path, change.eventId, false);
        await new Promise((r) => setTimeout(r, 1000));
        await fsUpload({
            path: FSPathMap.users.doc(u.uid),
            type: fsUploadType.update,
            data: {
                flags: fsFieldValue(FieldValue.arrayUnion("deleted")),
            },
        });
    });

export const customRestaurantRoles = functions
    .region("europe-west3")
    .firestore.document("config/roles")
    .onWrite((change, context) => {
        const document = change.after.exists
            ? FSRoles.check({
                  ...change.after.data(),
              })
            : {};

        const oldDocument = change.before.exists
            ? FSRoles.check({
                  ...change.before.data(),
              })
            : {};

        //sets custom claims for user & restaurant
        const setRoles = (roles: FSRoles): Promise<void[]> => {
            console.log(`set role ${JSON.stringify(roles)}`);

            return Promise.all(
                Object.keys(roles).map((uid) => {
                    return admin.auth().setCustomUserClaims(uid, {
                        role: roles[uid],
                    });
                })
            );
        };

        //removes a role of a user from a restaurant
        const removeRoles = (roles: FSRoles): Promise<void[]> => {
            return Promise.all(
                Object.keys(roles).map((uid) => {
                    // context.params.userId;
                    return admin.auth().setCustomUserClaims(uid, {});
                })
            );
        };

        if (
            Object.keys(oldDocument).length === 0 &&
            Object.keys(document).length !== 0
        ) {
            //if there is no previous document only setRoles / document created
            return setRoles(document);
        } else if (
            Object.keys(oldDocument).length !== 0 &&
            Object.keys(document).length === 0
        ) {
            //if there is no current document remove all previous roles / document cleared/deleted
            return removeRoles(oldDocument);
        } else if (
            Object.keys(oldDocument).length !== 0 &&
            Object.keys(document).length !== 0
        ) {
            //find roles which have been updated/created
            const newRoles = Object.keys(document).reduce((acc, key) => {
                if (oldDocument[key] === document[key]) return acc;
                return {
                    ...acc,
                    [key]: document[key],
                };
            }, {});
            const setPromises = setRoles(newRoles);

            //find which roles are not present in the new doc
            const outRoles = Object.keys(oldDocument).reduce((acc, key) => {
                if (document[key]) return acc;
                return {
                    ...acc,
                    [key]: oldDocument[key],
                };
            }, {});
            const removePromises = removeRoles(outRoles);
            return Promise.all([setPromises, removePromises]);
        }
        return null;
    });
