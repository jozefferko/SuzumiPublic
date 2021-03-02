import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Static} from 'runtypes';
import {FSPurchase} from '../common/types/firestore';

type SliceState = {[id: string]: Static<typeof FSPurchase>};

// First approach: define the initial state using that type
export const purchasesSlice = createSlice({
    name: 'purchases',
    initialState: {} as SliceState,
    reducers: {
        setPurchases: (
            state,
            action: PayloadAction<{[id: string]: Static<typeof FSPurchase>}>,
        ) => action.payload,
        pingPurchases: (state, action: PayloadAction<undefined>) => ({
            ...state,
        }),
    },
});
export const {setPurchases, pingPurchases} = purchasesSlice.actions;
