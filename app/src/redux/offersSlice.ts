import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Static} from 'runtypes';
import {FSOffer} from '../common/types/firestore';

type SliceState = {[id: string]: Static<typeof FSOffer>};

// First approach: define the initial state using that type
export const offersSlice = createSlice({
    name: 'offers',
    initialState: {} as SliceState,
    reducers: {
        setOffers: (
            state,
            action: PayloadAction<{[id: string]: Static<typeof FSOffer>}>,
        ) => action.payload,
    },
});
export const {setOffers} = offersSlice.actions;
