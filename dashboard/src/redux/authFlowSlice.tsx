import { createSlice } from '@reduxjs/toolkit';

type error = {
    type: string;
    message: string;
};

type authFlowState = {error: error | null};

const initialState: authFlowState = {
    error: null,
};
// First approach: define the initial state using that type
export const authFlowSlice = createSlice({
    name: 'authFlow',
    initialState,
    reducers: {
        setAuthFlowError: (
            state,
            {payload}: {payload: {type: string; message: string}},
        ) => {
            state.error = {
                type: payload.type,
                message: payload.message,
            };
        },
        clearError: (state, action) => {
            state.error = null;
        },
    },
});
export const {setAuthFlowError, clearError} = authFlowSlice.actions;
