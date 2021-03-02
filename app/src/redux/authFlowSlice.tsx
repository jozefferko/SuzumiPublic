import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearUser, signInUser} from './userSlice';

type error = {
    type: string;
    message: string;
};

type authFlowState = {
    error: error | null;
    missingPhone: boolean;
    missingData: boolean;
    fbCredential: FirebaseAuthTypes.AuthCredential | null;
};

const initialState: authFlowState = {
    error: null,
    missingPhone: false,
    missingData: false,
    fbCredential: null,
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
        setMissingPhone: (state, action: PayloadAction<undefined>) => {
            state.missingPhone = true;
        },
        fbCredentialSetter: (
            state,
            action: PayloadAction<FirebaseAuthTypes.AuthCredential>,
        ) => {
            state.fbCredential = action.payload;
        },
        clearFlow: (state, action) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                signInUser,
                (
                    state,
                    action: PayloadAction<{id: string; phoneNumber: string}>,
                ) => initialState,
            )
            .addCase(clearUser, (state: authFlowState, action) => ({
                ...initialState,
                fbCredential: state.fbCredential,
            }));
    },
});
export const {
    setAuthFlowError,
    clearError,
    setMissingPhone,
    fbCredentialSetter,
} = authFlowSlice.actions;
