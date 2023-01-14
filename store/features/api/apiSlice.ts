import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { fetchBaseQueryWithReauth, injectAuthApiSlice } from '../auth/authApiSlice';
export * from '../auth/authApiSlice';



export const apiSlice = createApi({
    reducerPath : 'api',
    baseQuery   : fetchBaseQueryWithReauth(fetchBaseQuery({
        baseUrl : 'http://localhost:3001',
    })),
    endpoints   : (builder) => ({
        post: builder.mutation<void, void>({
            query: () => ({
                url    : '/post',
                method : 'DELETE',
            }),
        }),
    }),
});
export const {
    usePostMutation,
} = apiSlice;



// inject auth apis:
export const {
    useAuth,
    useLogin,
    useLogout,
} = injectAuthApiSlice(apiSlice);
