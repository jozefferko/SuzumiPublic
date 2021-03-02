import * as admin from "firebase-admin";

const FieldValue = admin.firestore.FieldValue;
type FieldValue = admin.firestore.FieldValue;

const Timestamp = admin.firestore.Timestamp;
type Timestamp = admin.firestore.Timestamp;

export { Timestamp, FieldValue };
export interface DocumentSnapshot extends admin.firestore.DocumentSnapshot {}
export interface QuerySnapshot extends admin.firestore.QuerySnapshot {}
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export interface CollectionReference
    extends admin.firestore.CollectionReference {}
export interface DocumentReference extends admin.firestore.DocumentReference {}
export interface Query extends admin.firestore.Query {}
export const fsInstance = (): admin.firestore.Firestore => admin.firestore();
export type WhereFilterOp =
    | "<"
    | "<="
    | "=="
    | ">="
    | ">"
    | "array-contains"
    | "in"
    | "array-contains-any";
export type OrderByDirection = "asc" | "desc";
export type Transaction = admin.firestore.Transaction;
export type WriteResult = admin.firestore.WriteResult;
