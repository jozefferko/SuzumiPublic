import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {Static} from 'runtypes';
import {FSUser} from '../common/types/firestore';
import _ from 'lodash/fp';

export enum UserStatus {
    'off',
    'init',
    'loaded',
}

export type authFlow = {
    authFlow: {
        referredBy: string;
        socialCredential: FirebaseAuthTypes.AuthCredential | null;
    };
};

export type FAuthUser = {
    id: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
    displayName: string;
};

type signedOutState = authFlow & {
    id: null;
    status: UserStatus.off | UserStatus.init;
};
export type signedInState = authFlow & {
    status: UserStatus.init;
} & FAuthUser;
export type loadedState = {status: UserStatus.loaded} & Static<typeof FSUser> &
    authFlow;
type SliceState = signedOutState | signedInState | loadedState;
// First approach: define the initial state using that type
export const userSlice = createSlice({
    name: 'user',
    initialState: {
        id: null,
        status: UserStatus.off,
        authFlow: {
            referredBy: '',
            socialCredential: null,
        },
    } as SliceState,
    reducers: {
        clearUser: (
            state,
            action: PayloadAction<undefined>,
        ): Draft<SliceState> => ({
            id: null,
            status: UserStatus.init,
            authFlow: {
                referredBy: '',
                socialCredential: null,
            },
        }),
        setReferredBy: (state, action: PayloadAction<string>): void => {
            state.authFlow.referredBy = action.payload;
        },
        setSocialCredential: (
            state,
            action: PayloadAction<FirebaseAuthTypes.AuthCredential>,
        ): void => {
            state.authFlow.socialCredential = action.payload;
        },
        signInUser: (
            state,
            action: PayloadAction<FAuthUser>,
        ): Draft<SliceState> => ({
            ...action.payload,
            authFlow: state.authFlow,
            status: UserStatus.init,
        }),
        setUserData: (
            state,
            action: PayloadAction<Static<typeof FSUser>>,
        ): Draft<SliceState> => {
            const newState: loadedState & authFlow = {
                ...action.payload,
                authFlow: state.authFlow,
                status: UserStatus.loaded,
            };
            return _.isEqual(state, newState) ? state : newState;
        },
    },
});
export const {
    clearUser,
    signInUser,
    setSocialCredential,
    setUserData,
} = userSlice.actions;
