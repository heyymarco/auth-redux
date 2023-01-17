import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { apiSlice } from './features/api/apiSlice';
// import authSlice from './features/auth/authSlice';



export const store = configureStore({
    reducer    : {
        // auth                   : authSlice,
        [apiSlice.reducerPath] : apiSlice.reducer,
    },
    middleware : (getDefaultMiddleware) => getDefaultMiddleware().concat(
        apiSlice.middleware,
    ),
    devTools   : (process.env.NODE_ENV === 'production'),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>
