import {configureStore} from '@reduxjs/toolkit';
import {authFlowSlice} from './authFlowSlice';
import {cacheSlice} from './cacheSlice';
import {offersSlice} from './offersSlice';
import {productsSlice} from './productsSlice';
import {purchasesSlice} from './purchasesSlice';
import {restaurantSlice} from './restaurantSlice';
import {settingsSlice} from './settingsSlice';
import {transactionsSlice} from './transactionsSlice';
import {userSlice} from './userSlice';
import {contestSlice} from './contestSlice';

export const store = configureStore({
    reducer: {
        authFlow: authFlowSlice.reducer,
        user: userSlice.reducer,
        restaurant: restaurantSlice.reducer,
        products: productsSlice.reducer,
        purchases: purchasesSlice.reducer,
        offers: offersSlice.reducer,
        transactions: transactionsSlice.reducer,
        settings: settingsSlice.reducer,
        cache: cacheSlice.reducer,
        contest: contestSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
