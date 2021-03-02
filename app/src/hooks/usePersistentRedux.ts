import AsyncStorage from '@react-native-community/async-storage';
import {ActionCreatorWithPayload} from '@reduxjs/toolkit';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Runtype} from 'runtypes';
import {
    fromThrowableAsync,
    fromThrowableC,
    nothingLog,
} from '../common/utils/fp';
import {RootState} from '../redux';

const loadData = async (key: string): Promise<Maybe<string>> => {
    return (await fromThrowableAsync(AsyncStorage.getItem, key))
        .chain(Maybe.fromNullable)
        .ifNothing(nothingLog(`no data saved key:${key}`));
};

const saveData = async (key: string, data: any) => {
    const stringified = JSON.stringify(data);
    const current = (await loadData(key)).orDefault('');
    try {
        if (stringified !== current) {
            await AsyncStorage.setItem(key, stringified);
        }
    } catch (e) {
        console.log(e);
    }
};

const eraseData = (key: string): Promise<void> => {
    return AsyncStorage.removeItem(key).catch(() => {
        console.log('error deleting async storage');
    });
};

export const usePersistentRedux = <T>(
    key: string,
    initialState: T,
    runtype: Runtype<T>,
    selector: (state: RootState) => T | null,
    action: ActionCreatorWithPayload<T>,
    clear: boolean = false,
): void => {
    const [cleared, setCleared] = useState(clear);
    const d = useDispatch();
    useEffect(() => {
        cleared
            ? eraseData(key).then(() => {
                  setCleared(true);
              })
            : loadData(key).then((result) => {
                  _.flow(
                      action,
                      d,
                  )(
                      result
                          .map(JSON.parse)
                          .chain(fromThrowableC(runtype.check))
                          .orDefault(initialState),
                  );
              });
    }, [initialState, runtype, d, action, key, cleared]);

    const data = useSelector(selector);
    useEffect(() => {
        if (data) {
            saveData(key, data);
        }
    }, [key, data]);
};
