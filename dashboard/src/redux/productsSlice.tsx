import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Static } from "runtypes";
import { FSProduct } from "../common/types/firestore";

type SliceState = { [id: string]: Static<typeof FSProduct> };

// First approach: define the initial state using that type
export const productsSlice = createSlice({
    name: "products",
    initialState: {} as SliceState,
    reducers: {
        setProducts: (
            state,
            action: PayloadAction<{ [id: string]: Static<typeof FSProduct> }>
        ) => action.payload,
    },
});
export const { setProducts } = productsSlice.actions;
