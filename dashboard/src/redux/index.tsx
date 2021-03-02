import { configureStore } from "@reduxjs/toolkit";
import { authFlowSlice } from "./authFlowSlice";
import { cacheSlice } from "./cacheSlice";
import { offersSlice } from "./offersSlice";
import { productsSlice } from "./productsSlice";
import { restaurantSlice } from "./restaurantSlice";
import { userSlice } from "./userSlice";
import { cachedMembersSlice } from "./cachedMembersSlice";
import { statsSlice } from "./statsSlice";

export const store = configureStore({
    reducer: {
        authFlow: authFlowSlice.reducer,
        user: userSlice.reducer,
        restaurant: restaurantSlice.reducer,
        stats: statsSlice.reducer,
        products: productsSlice.reducer,
        offers: offersSlice.reducer,
        cache: cacheSlice.reducer,
        cachedMembers: cachedMembersSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
