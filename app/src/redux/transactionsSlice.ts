import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Static} from 'runtypes';
import {FSTransaction} from '../common/types/firestore';
import {clearUser} from './userSlice';

export type TransactionsSliceState = {
    [id: string]: Static<typeof FSTransaction>;
};

// First approach: define the initial state using that type
export const transactionsSlice = createSlice({
    name: 'transactions',
    initialState: {} as TransactionsSliceState,
    reducers: {
        setTransactions: (
            state,
            action: PayloadAction<{[id: string]: Static<typeof FSTransaction>}>,
        ) => action.payload,
    },
    extraReducers: (builder) => {
        builder.addCase(
            clearUser,
            (state: TransactionsSliceState, action) => ({}),
        );
    },
});
export const {setTransactions} = transactionsSlice.actions;
