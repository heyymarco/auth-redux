// redux toolkit:
import {
    createApi,
    fetchBaseQuery,
}                               from '@reduxjs/toolkit/query/react'

// redux auth:
import {
    fetchBaseQueryWithReauth,
    injectAuthApiSlice,
}                               from '../auth/authApiSlice-react'
export *                        from '../auth/authApiSlice-react'

// internals:
import config                   from '../../../redux-auth.config'



export const apiSlice = createApi({
    reducerPath : 'api',
    baseQuery   : fetchBaseQueryWithReauth(fetchBaseQuery({
        baseUrl : 'http://localhost:3001',
    })),
    endpoints   : (builder) => ({
        post: builder.mutation<void, void>({
            query: () => ({
                url             : '/post',
                method          : 'DELETE',
                responseHandler : 'content-type',
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
    usePersistLogin,
} = injectAuthApiSlice(apiSlice, config);
