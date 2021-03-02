import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Static } from "runtypes";
import { FSUser } from "../common/types/firestore";
import { dictionarify } from "../common/utils/firestore/normalize";

type SliceState = { [id: string]: Static<typeof FSUser> };

// First approach: define the initial state using that type
export const cachedMembersSlice = createSlice({
    name: "cachedMembers",
    initialState: {} as SliceState,
    reducers: {
        cacheMember: (state, action: PayloadAction<Static<typeof FSUser>>) => ({
            ...state,
            [action.payload.id]: action.payload,
        }),
        cacheMembers: (
            state,
            action: PayloadAction<Static<typeof FSUser>[]>
        ) => ({
            ...state,
            ...dictionarify(action.payload),
        }),
    },
});
export const { cacheMember, cacheMembers } = cachedMembersSlice.actions;
