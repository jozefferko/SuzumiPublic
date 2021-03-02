import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { Static } from "runtypes";
import { FSRole } from "../common/types/firestore";

export enum UserStatus {
    "off",
    "init",
    "loaded",
}

type signedOutState = {
    id: null;
    status: UserStatus.off | UserStatus.init;
};
export type signedInState = {
    id: string;
    status: UserStatus.init;
    role: Static<typeof FSRole>;
    email: string;
};
type SliceState = signedOutState | signedInState;
// First approach: define the initial state using that type
export const userSlice = createSlice({
    name: "user",
    initialState: {
        id: null,
        status: UserStatus.off,
    } as SliceState,
    reducers: {
        clearUser: (
            state,
            action: PayloadAction<undefined>
        ): Draft<SliceState> => ({
            id: null,
            status: UserStatus.init,
        }),

        setUserID: (
            state,
            action: PayloadAction<{
                id: string;
                email: string;
                role: Static<typeof FSRole>;
            }>
        ): Draft<SliceState> => ({
            id: action.payload.id,
            email: action.payload.email,
            status: UserStatus.init,
            role: action.payload.role,
        }),
    },
});
export const { clearUser, setUserID } = userSlice.actions;
