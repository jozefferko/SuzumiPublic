import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/messaging";
import "firebase/storage";

const firebaseConfig = {
};
export const app = firebase;
export const functions = firebase
    .initializeApp(firebaseConfig)
    .functions("europe-west3");
export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const storage = firebase.storage().ref();
// try {
//     firebase
//         .messaging()
//         .usePublicVapidKey(
//             "BGHvySFfSy-8mpRw7mZJBAuEdrmv31CZAiwM-b2lnClAJA1hByG-pHVmLrm21f387BMcoCrTO6-lR791j8slTjM"
//         );
// } catch (e) {
//     console.log(e);
// }
