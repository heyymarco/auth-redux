// redux:
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
export interface Authentication {
    // username     : string // the `username` is encoded in `accessToken`
    accessToken     : string
    // refreshToken : string // for security reason: the `refreshToken` should be in the http_only_cookie
}



// private store:
let accessToken : Authentication['accessToken']|undefined = undefined;



// handlers:
const updateAccessTokenResponseHandler : ResponseHandler = async (response) => {
    if (response.ok) {
        try {
            accessToken = await config.parseAccessToken(response);
        }
        catch {
            accessToken = undefined; // discard access token (a failed login/refreshToken causes logout)
        } // try
    } // if
    
    
    
    return null; // nothing to save to Redux, the accessToken is safe to be stored in module's variable
};
const logoutResponseHandler : ResponseHandler = async () => {
    accessToken = undefined; // discard access token, it will lost until expired
    
    
    
    return null; // nothing to save to Redux
};

const fetchRefreshToken = () : FetchArgs => ({
    url             : config.authRefreshPath,
    method          : config.authRefreshMethod,
    credentials     : 'include',                        // need to SEND_BACK `refreshToken` in the `http_only_cookie`
    responseHandler : updateAccessTokenResponseHandler, // will RECEIVE a new `accessToken` to be stored to a private_store
});
const fetchLogin = (credential: Credential) : FetchArgs => ({
    url             : config.loginPath,
    method          : config.loginMethod,
    credentials     : 'include',                        // need to RECEIVE `refreshToken` in the `http_only_cookie`
    body            : credential,                       // post the username & password to be verified on backend
    responseHandler : updateAccessTokenResponseHandler, // will RECEIVE a `accessToken` to be stored to a private_store
});
const fetchLogout = () : FetchArgs => ({
    url             : config.logoutPath,
    method          : config.logoutMethod,
    credentials     : 'include',                        // need to DELETE `refreshToken` in the `http_only_cookie`
    responseHandler : logoutResponseHandler,
});




// actions:

export const injectAuthApiSlice = <
    TBaseQuery   extends BaseQueryFn,
    TDefinitions extends EndpointDefinitions,
    TReducerPath extends string,
    TTagTypes    extends string,
    TEnhancers   extends ModuleName
>(apiSlice: Api<TBaseQuery, TDefinitions, TReducerPath, TTagTypes, TEnhancers>) => {
    // inject auth endpoints:
    const injectedAuthApiSlice = (apiSlice as Api<BaseQueryFn, {}, TReducerPath, TTagTypes, typeof reactHooksModuleName>).injectEndpoints({
        endpoints  : (builder) => ({
            auth   : builder.mutation<Authentication, void>({
                query : fetchRefreshToken,
            }),
            login  : builder.mutation<Authentication, Credential>({
                query : fetchLogin,
            }),
            logout : builder.mutation<void, void>({
                query : fetchLogout,
            }),
        }),
    });
    
    
    
    // rename the hooks to more human readable names:
    const {
        useAuthMutation   : useAuth,
        useLoginMutation  : useLogin,
        useLogoutMutation : useLogout,
    } = injectedAuthApiSlice;
    
    // return the injected apiSlice:
    return {
        useAuth,
        useLogin,
        useLogout,
        ...injectedAuthApiSlice
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
    
    
    
    if (!normalizedHeaders.has('Authorization')) {
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
            await baseQueryFn(fetchRefreshToken(), api, extraOptions);
            if (accessToken) {
                // retry the initial query:
                result = await baseQueryFn(injectArgs(args), api, extraOptions);
            } // if
        } // if
        
        
        
        return result;
    };
    return interceptedBaseQueryFn;
};

