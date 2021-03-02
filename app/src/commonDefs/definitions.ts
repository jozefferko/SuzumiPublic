import firestore, {
    FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

// interface QuerySnapshot {
//     empty: boolean;
//     docs: DocumentSnapshot[];
// }
// interface DocumentSnapshot {
//     exists: boolean;
//     id: string;
//     data: () => any;
// }

const {FieldValue} = firestore;
type FieldValue = FirebaseFirestoreTypes.FieldValue;

const {Timestamp} = firestore;
type Timestamp = FirebaseFirestoreTypes.Timestamp;

export {Timestamp, FieldValue};
export interface DocumentSnapshot
    extends FirebaseFirestoreTypes.DocumentSnapshot {}
export interface QuerySnapshot extends FirebaseFirestoreTypes.QuerySnapshot {}
export interface CollectionReference
    extends FirebaseFirestoreTypes.CollectionReference {}
export interface DocumentReference
    extends FirebaseFirestoreTypes.DocumentReference {}
export type Query = FirebaseFirestoreTypes.Query & {
    offset?: (a: number) => Query;
};
export const fsInstance = (): FirebaseFirestoreTypes.Module => firestore();
export type WhereFilterOp = FirebaseFirestoreTypes.WhereFilterOp;
export type OrderByDirection = 'asc' | 'desc';
export type Transaction = FirebaseFirestoreTypes.Transaction;
export type WriteResult = void;
