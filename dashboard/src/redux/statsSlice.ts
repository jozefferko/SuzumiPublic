import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Static } from "runtypes";
import { FSRestaurant, FSStats } from "../common/types/firestore";

type SliceState = null | FSStats;

// First approach: define the initial state using that type
export const statsSlice = createSlice({
    name: "stats",
    initialState: null as SliceState,
    reducers: {
        setStats: (state, action: PayloadAction<FSStats>) => action.payload,
    },
});
export const { setStats } = statsSlice.actions;
