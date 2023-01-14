// redux:
import type {
    AnyAction,
    ThunkDispatch,
}                               from '@reduxjs/toolkit'
import type {
    // fetches:
    BaseQueryFn,
    fetchBaseQuery,
    
    
    
    // RTK Query:
    Api,
    EndpointDefinitions,
}                               from '@reduxjs/toolkit/query'
import type {
    // requests & responses:
    FetchArgs,
    ResponseHandler,
}                               from '@reduxjs/toolkit/dist/query/fetchBaseQuery'
import type {
    // modules:
    ModuleName,
}                               from '@reduxjs/toolkit/dist/query/apiTypes'

// vanilla-redux:
import type {
    coreModuleName,
}                               from '@reduxjs/toolkit/dist/query/core/module'

// react-redux:
import type {
    // react specific hooks:
    reactHooksModuleName,
}                               from '@reduxjs/toolkit/dist/query/react/module'

// internals:
import config                   from './authConfig'




// types:
export interface Credential {
    username : string
    password : string
}
export type AccessToken = string & {}
export interface Authentication {
    // username     : string // the `username` is encoded in `accessToken`
    accessToken     : AccessToken
    // refreshToken : string // for security reason: the `refreshToken` should be in the http_only_cookie
}



// private store:
let accessToken : Authentication['accessToken']|undefined = undefined;



// handlers:
const fetchRefreshToken = () : FetchArgs => ({
    url             : config.authRefreshPath,
    method          : config.authRefreshMethod,
    credentials     : 'include',           // need to SEND_BACK `refreshToken` in the `http_only_cookie`
    responseHandler : 'content-type',
});
const fetchLogin = (credential: Credential) : FetchArgs => ({
    url             : config.loginPath,
    method          : config.loginMethod,
    credentials     : 'include',           // need to RECEIVE `refreshToken` in the `http_only_cookie`
    body            : credential,          // post the username & password to be verified on backend
    responseHandler : 'content-type',
});
const fetchLogout = () : FetchArgs => ({
    url             : config.logoutPath,
    method          : config.logoutMethod,
    credentials     : 'include',           // need to DELETE `refreshToken` in the `http_only_cookie`
    responseHandler : 'content-type',
});
let apiDispatch : ThunkDispatch<any, any, AnyAction>|undefined = undefined;




// actions:

export const injectAuthApiSlice = <
    TBaseQuery   extends BaseQueryFn,
    TDefinitions extends EndpointDefinitions,
    TReducerPath extends string,
    TTagTypes    extends string,
    TEnhancers   extends ModuleName
>(apiSlice: Api<TBaseQuery, TDefinitions, TReducerPath, TTagTypes, TEnhancers>) => {
    // inject auth endpoints:
    const injectedAuthApiSlice = (apiSlice as unknown as Api<BaseQueryFn, {}, TReducerPath, TTagTypes, typeof coreModuleName | typeof reactHooksModuleName>).injectEndpoints({
        endpoints  : (builder) => ({
            auth   : builder.query<AccessToken, void>({
                query : fetchRefreshToken,
                async transformResponse(response, meta, arg) {
                    // parse the response to get `accessToken`:
                    return await config.parseAccessToken(response);
                },
                onCacheEntryAdded(arg, api) {
                    if (!apiDispatch) {
                        // steal the `dispatch()` for the `re-auth`:
                        apiDispatch = api.dispatch;
                        
                        
                        
                        // prevents the `accessToken` cache data from being deleted by making a subscription by calling `dispatch(initiate())`:
                        apiDispatch(
                            injectedAuthApiSlice.endpoints.auth.initiate()
                        );
                    } // if
                },
            }),
            login  : builder.mutation<AccessToken, Credential>({
                query : fetchLogin,
                async transformResponse(response, meta, arg) {
                    // parse the response to get `accessToken`:
                    return await config.parseAccessToken(response);
                },
                async onCacheEntryAdded(credential, api) {
                    if (!apiDispatch) {
                        // steal the `dispatch()` for the `re-auth`:
                        apiDispatch = api.dispatch;
                        
                        
                        
                        // prevents the `accessToken` cache data from being deleted by making a subscription by calling `dispatch(initiate())`:
                        apiDispatch(
                            injectedAuthApiSlice.endpoints.auth.initiate()
                        );
                    } // if
                    
                    
                    
                    let accessToken : AccessToken|undefined = undefined;
                    try {
                        // wait until the login mutation is `fulfilled`, so the `data` can be consumed:
                        accessToken = (await api.cacheDataLoaded).data;
                    }
                    catch {
                        // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                        // in which case `cacheDataLoaded` will throw
                    } // try
                    
                    
                    
                    if (accessToken) {
                        // an artificial `auth` api request to trigger: `pending` => `queryResultPatched` (if needed) => `fulfilled`:
                        await api.dispatch(
                            injectedAuthApiSlice.util.upsertQueryData('auth' as any, undefined, accessToken)
                        );
                    } // if
                },
            }),
            logout : builder.mutation<void, void>({
                query : fetchLogout,
                transformResponse(response, meta, arg) {
                    // no need to store any data:
                    return undefined;
                },
            }),
        }),
    });
    
    
    
    // rename the hooks to more human readable names:
    const {
        useAuthQuery      : useAuth,
        useLoginMutation  : useLogin,
        useLogoutMutation : useLogout,
    } = injectedAuthApiSlice;
    
    // return the combined apiSlice:
    return {
        useAuth,
        useLogin,
        useLogout,
        ...apiSlice
    };
};



// utils:
type RawHeaders = Headers | string[][] | Record<string, string | undefined> | undefined
const normalizeHeaders = (headers: RawHeaders): Headers => {
    if (!headers)                   return new Headers();
    if (headers instanceof Headers) return headers;
    if (Array.isArray(headers))     return new Headers(headers as [string, string][]);
    return new Headers(Object.entries(headers).map(([key, value]) => [key, value ?? ''] as [string, string]));
};
const injectHeaders = (headers: RawHeaders): Headers => {
    const normalizedHeaders = normalizeHeaders(headers);
    
    
    
    if (accessToken && !normalizedHeaders.has('Authorization')) {
        normalizedHeaders.set('Authorization', `Bearer ${accessToken}`);
    } // if
    
    
    
    return normalizedHeaders;
};

type RawArgs = string | FetchArgs
const normalizeArgs = (args: RawArgs): FetchArgs => {
    if (typeof(args) === 'string') return { url: args };
    return args;
};
const injectArgs = (args: RawArgs): FetchArgs => {
    const normalizedArgs = normalizeArgs(args);
    
    
    
    normalizedArgs.headers = injectHeaders(normalizedArgs.headers);
    
    
    
    return normalizedArgs;
};



// fetch proxy:

export const fetchBaseQueryWithReauth = (baseQueryFn: ReturnType<typeof fetchBaseQuery>): ReturnType<typeof fetchBaseQuery> => {
    const interceptedBaseQueryFn : typeof baseQueryFn = async (args, api, extraOptions) => {
        // the initial query:
        let result = await baseQueryFn(injectArgs(args), api, extraOptions);
        
        
        
        // re-auth:
        if (accessToken && result.error && [config.tokenExpiredStatus].flat().includes(result.error.status)) {
            // re-generate accessToken:
            await baseQueryFn(fetchRefreshToken(), api, extraOptions);
            if (accessToken) {
                // retry the initial query with a new accessToken:
                result = await baseQueryFn(injectArgs(args), api, extraOptions);
            }
            else {
                // failed to re-generate accessToken because the user was loggedOut or the refreshToken was expired
            }
        } // if
        
        
        
        return result;
    };
    return interceptedBaseQueryFn;
};

