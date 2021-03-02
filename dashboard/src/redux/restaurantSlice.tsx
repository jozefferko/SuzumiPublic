import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Static } from "runtypes";
import { FSRestaurant } from "../common/types/firestore";

type SliceState = null | Static<typeof FSRestaurant>;

// First approach: define the initial state using that type
export const restaurantSlice = createSlice({
    name: "user",
    initialState: null as SliceState,
    reducers: {
        setRestaurant: (
            state,
            action: PayloadAction<Static<typeof FSRestaurant>>
        ) => action.payload,
        hydrateRestaurant: (
            state,
            action: PayloadAction<Static<typeof FSRestaurant>>
        ) => (state ? state : action.payload),
    },
});
export const { setRestaurant, hydrateRestaurant } = restaurantSlice.actions;
