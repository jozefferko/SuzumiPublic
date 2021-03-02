import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Static} from 'runtypes';
import {FSCache} from '../common/types/firestore';

type SliceState = null | Static<typeof FSCache>;

// First approach: define the initial state using that type
export const cacheSlice = createSlice({
    name: 'cache',
    initialState: null as SliceState,
    reducers: {
        setCache: (state, action: PayloadAction<Static<typeof FSCache>>) =>
            action.payload,
    },
});
export const {setCache} = cacheSlice.actions;
