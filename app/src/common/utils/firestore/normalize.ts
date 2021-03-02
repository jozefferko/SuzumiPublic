import {CondPair} from 'lodash';
import * as _ from 'lodash/fp';
import {Static} from 'runtypes';
import {
    DocumentSnapshot,
    FieldValue,
    QuerySnapshot,
    Timestamp,
} from '../../../commonDefs/definitions';
import {FSTimestamp} from '../../types/firestore';
import {wID} from '../../types/misc';
import {fMap} from '../fp';
import {FsFieldValue} from './queries';
// import _ from 'lodash/fp';

const createConverter = <T>(
    condition: (v: any) => v is T,
    converter: (v: T) => any,
): CondPair<T, any> => [condition, converter];
const deepConvert = <T>(converters: CondPair<any, any>[]) => (val: any): any =>
    _.cond([
        ...converters,
        [Array.isArray, fMap(deepConvert(converters))],
        [_.isObject, _.mapValues(deepConvert(converters))],
        [_.stubTrue, _.identity],
    ])(val);

const serializeTimestamp = (
    timestamp: Timestamp,
): Static<typeof FSTimestamp> => ({
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
});

const isTimestamp = (val: any): val is Timestamp => val instanceof Timestamp;

export const deSerializeTimestamp = (
    timestamp: Static<typeof FSTimestamp>,
): Timestamp | FieldValue =>
    timestamp.seconds === 0 && timestamp.nanoseconds === 0
        ? FieldValue.serverTimestamp()
        : new Timestamp(timestamp.seconds, timestamp.nanoseconds);

const convertFieldValue = (v: FsFieldValue) => v.value;

const normalizers: CondPair<any, any>[] = [
    createConverter(isTimestamp, serializeTimestamp),
];
const denormalizers: CondPair<any, any>[] = [
    createConverter(FSTimestamp.guard, deSerializeTimestamp),
    createConverter(
        (val: any): val is FsFieldValue => val && val.type === 'fieldvalue',
        convertFieldValue,
    ),
];
export const dotAnnotateExclude = (converters: CondPair<any, any>[]) => (
    val: any,
    str: string = '',
): Object =>
    typeof val === 'object' &&
    val !== null &&
    !(val instanceof Array) &&
    converters.reduce((acc, pair) => acc && !pair[0](val), true)
        ? Object.keys(val).reduce(
              (acc: {[i: string]: any}, key) => ({
                  ...acc,
                  ...dotAnnotateExclude(converters)(
                      val[key],
                      str ? `${str}.${key}` : key,
                  ),
              }),
              {},
          )
        : {[str]: val};
export const dotAnnotate = dotAnnotateExclude(denormalizers);

export const extractFSDoc = (doc: DocumentSnapshot): {id: string} =>
    deepConvert(normalizers)({...doc.data(), id: doc.id});

export const extractFSQuery = (snapshot: QuerySnapshot): {id: string}[] =>
    snapshot.docs.map(extractFSDoc);

export const dictionarify = <T extends wID>(docs: T[]): {[id: string]: T} =>
    docs.reduce(
        (acc, doc) => ({
            ...acc,
            [doc.id]: doc,
        }),
        {},
    );

export const removeId = <T extends wID>(doc: T): Omit<T, 'id'> => {
    const {id, ...rest} = doc;
    return rest;
};

export const deNormalize = _.flow(removeId, deepConvert(denormalizers));

export const serverTimestamp = (): Static<typeof FSTimestamp> => ({
    seconds: 0,
    nanoseconds: 0,
});
