import firebase from "firebase";
import { app, firestore } from "../firebase";

const FieldValue = app.firestore.FieldValue;
type FieldValue = firebase.firestore.FieldValue;

const Timestamp = firebase.firestore.Timestamp;
type Timestamp = firebase.firestore.Timestamp;

export { Timestamp, FieldValue };
export interface DocumentSnapshot extends firebase.firestore.DocumentSnapshot {}
export interface QuerySnapshot extends firebase.firestore.QuerySnapshot {}
export interface CollectionReference
    extends firebase.firestore.CollectionReference {}
export interface DocumentReference
    extends firebase.firestore.DocumentReference {}
export type Query = firebase.firestore.Query & {
    offset?: (a: number) => Query;
};
export const fsInstance = (): firebase.firestore.Firestore => firestore;
export type WhereFilterOp = firebase.firestore.WhereFilterOp;
export type OrderByDirection = firebase.firestore.OrderByDirection;
export type Transaction = firebase.firestore.Transaction;
export type WriteResult = void;
