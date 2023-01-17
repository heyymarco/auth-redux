// redux toolkit:
import type {
    // fetches:
    BaseQueryFn,
    fetchBaseQuery,
    
    
    
    // RTK Query:
    Api,
    EndpointDefinitions,
}                               from '@reduxjs/toolkit/query'
import type {
    // base queries:
    QueryReturnValue,
    BaseQueryError,
}                               from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type {
    // requests & responses:
    FetchArgs,
}                               from '@reduxjs/toolkit/dist/query/fetchBaseQuery'
import type {
    // modules:
    ModuleName,
}                               from '@reduxjs/toolkit/dist/query/apiTypes'

// vanilla redux toolkit:
import type {
    coreModuleName,
}                               from '@reduxjs/toolkit/dist/query/core/module'

// react redux toolkit:
import type {
    // react specific hooks:
    reactHooksModuleName,
}                               from '@reduxjs/toolkit/dist/query/react/module'

// other libs:
import jwt_decode               from 'jwt-decode'
import {
    // tests:
    isBrowser,
    isJsDom,
}                               from 'is-in-browser'



// utilities:
export const isClientSide : boolean = isBrowser || isJsDom;



// types:
export interface Credential {
    username : string
    password : string
}
export type Authentication = unknown & {}
export type AccessToken    = string  & {}



// shared apis:
let authConfig          : Required<AuthOptions>|undefined = undefined;
let authApi : {
    getAccessToken      : () => Promise<AccessToken|null|undefined>
    refreshAccessToken  : () => Promise<AccessToken|null|undefined>
    logout              : (forceLogout?: boolean) => Promise<void>
} | undefined = undefined;



// actions:

export type HttpRequestMethod = 'GET'|'HEAD'|'POST'|'PUT'|'DELETE'|'CONNECT'|'OPTIONS'|'TRACE'|'PATCH'|(string & {});

export interface AuthOptions {
    // auth server:
    authServerURL       ?: string
    tokenExpiredStatus  ?: number|string|(number|string)[],
    
    selectAccessToken   ?: (auth: Authentication) => AccessToken
    selectUsername      ?: (decoded: {}) => (string|number)
    selectRoles         ?: (decoded: {}) => (string|number)[]
    
    authRefreshPath     ?: string,
    authRefreshMethod   ?: HttpRequestMethod
    
    loginPath           ?: string
    loginMethod         ?: HttpRequestMethod
    
    logoutPath          ?: string
    logoutMethod        ?: HttpRequestMethod
    
    
    
    // behaviors:
    persistLoginKey     ?: string,
    defaultPersistLogin ?: boolean,
}
const configureOptions = (options?: AuthOptions): Required<AuthOptions> => {
    const {
        // auth server:
        authServerURL       = 'http://localhost:3001',
        tokenExpiredStatus  = 403,
        
        selectAccessToken   = (auth: Authentication): AccessToken => {
            const accessToken = (auth as any)?.accessToken;
            if ((accessToken === undefined) || (accessToken === null)) throw Error('invalid data');
            return accessToken;
        },
        selectUsername      = (decoded: {}): (string|number) => {
            const username = (decoded as any)?.username;
            if ((username === undefined) || (username === null)) throw Error('invalid data');
            return username;
        },
        selectRoles         = (decoded: {}): (string|number)[] => {
            const roles = (decoded as any)?.username;
            if ((roles === undefined) || (roles === null)) throw Error('invalid data');
            if (!Array.isArray(roles)) return [roles];
            return roles;
        },
        
        authRefreshPath     = 'refresh',
        authRefreshMethod   = 'GET',
        
        loginPath           = '/login',
        loginMethod         = 'POST',
        
        logoutPath          = '/logout',
        logoutMethod        = 'POST',
        
        
        
        // behaviors:
        persistLoginKey     = 'persistLogin',
        defaultPersistLogin = false,
    ...restOptions} = options ?? {};
    
    
    
    return {
        // auth server:
        authServerURL,
        tokenExpiredStatus,
        
        selectAccessToken,
        selectUsername,
        selectRoles,
        
        authRefreshPath,
        authRefreshMethod,
        
        loginPath,
        loginMethod,
        
        logoutPath,
        logoutMethod,
        
        
        
        // behaviors:
        persistLoginKey,
        defaultPersistLogin,
        
        
        
        ...restOptions
    };
};

export const injectAuthApiSlice = <
    TBaseQuery   extends BaseQueryFn,
    TDefinitions extends EndpointDefinitions,
    TReducerPath extends string,
    TTagTypes    extends string,
    TEnhancers   extends ModuleName
>(apiSlice: Api<TBaseQuery, TDefinitions, TReducerPath, TTagTypes, TEnhancers>, options?: AuthOptions) => {
    // configurations:
    const config = configureOptions(options);
    authConfig = config;
    
    
    
    // inject auth endpoints:
    const injectedAuthApiSlice = (
        (apiSlice as unknown as Api<BaseQueryFn, {}, TReducerPath, TTagTypes, typeof coreModuleName | typeof reactHooksModuleName>)
        .injectEndpoints({
            endpoints  : (builder) => ({
                auth   : builder.query<Authentication|null, void>({
                    async queryFn(noParam, api, extraOptions, baseQuery): Promise<QueryReturnValue<Authentication|null, BaseQueryError<TBaseQuery>, {}>> {
                        if (!isClientSide) { // server side only
                            return new Promise<QueryReturnValue<Authentication|null, BaseQueryError<TBaseQuery>, {}>>(() => {
                                /*
                                    never resolved!
                                    ensures:
                                    * the server_side pre_rendering_html always in `loading...`
                                    * no http `/refresh` request on server_side during pre_rendering_html
                                */
                            });
                        } // if
                        
                        
                        
                        const isInitialSetup = !('data' in injectedAuthApiSlice.endpoints.auth.select(undefined)(api.getState() as any));
                        
                        
                        
                        /*
                            when the `auth` is not initialized `(data === undefined)` -and- NO_persistLogin,
                            the FIRST request attempt treated as loggedOut.
                            
                            the subsequent request will be normal request.
                        */
                        if(isInitialSetup) { // the `auth` is not initialized `(data === undefined)`
                            if (!getPersistLogin()) {
                                console.log('noPersistLogin => mark as logged out');
                                // mark accessToken as loggedOut:
                                return {
                                    data: null /* = loggedOut */,
                                };
                            } // if
                        } // if
                        
                        
                        
                        // normal request:
                        const result = await (baseQuery as unknown as BaseQueryFn<RawArgs, Authentication, BaseQueryError<TBaseQuery>>)({
                            url             : config.authRefreshPath,
                            method          : config.authRefreshMethod,
                            credentials     : 'include',           // need to SEND_BACK `refreshToken` in the `http_only_cookie`
                            responseHandler : 'content-type',
                        }, api, extraOptions);
                        
                        
                        
                        /*
                            when the `auth` is not initialized `(data === undefined)` -and- the server responses `forbidden`,
                            the FIRST `forbidden` response treated as loggedOut.
                            
                            the subsequent errors will be normal.
                        */
                        if (isInitialSetup && result.error && authConfig && ([authConfig.tokenExpiredStatus].flat().includes((result.error as any).status) || (((result.error as any).status >= 300) && ((result.error as any).status < 500) && ((result.error as any).status !== 408)))) { // forbidden, redirect_page, 3xx status, not_found, 4xx status, exept 408 status (request timeout)
                            console.log('error => mark as logged out');
                            // mark accessToken as loggedOut:
                            return {
                                data: null /* = loggedOut */,
                            };
                        } // if
                        
                        
                        
                        return result;
                    },
                    extraOptions: {
                        noAuth: true,
                    },
                }),
                login  : builder.mutation<Authentication, Credential>({
                    query : (credential: Credential) => ({
                        url             : config.loginPath,
                        method          : config.loginMethod,
                        credentials     : 'include',           // need to RECEIVE `refreshToken` in the `http_only_cookie`
                        body            : credential,          // post the username, password (and optionally additional properties) to be verified on backend
                        responseHandler : 'content-type',
                    }),
                    extraOptions: {
                        noAuth: true,
                    },
                    async onCacheEntryAdded(credential, api) {
                        let authentication : Authentication|undefined = undefined;
                        try {
                            // wait until the login mutation is `fulfilled`, so the `data` can be consumed:
                            authentication = (await api.cacheDataLoaded).data;
                        }
                        catch {
                            // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                            // in which case `cacheDataLoaded` will throw
                        } // try
                        
                        
                        
                        // update with a new authentication:
                        if (authentication !== undefined) {
                            // an artificial `auth` api request to trigger: `pending` => `queryResultPatched` (if needed) => `fulfilled`:
                            await api.dispatch(
                                injectedAuthApiSlice.util.upsertQueryData('auth' as any, /* noParam: */ undefined, /* authentication: */ authentication)
                            );
                        } // if
                    },
                }),
                logout : builder.mutation<void, boolean|undefined>({
                    query : () => ({
                        url             : config.logoutPath,
                        method          : config.logoutMethod,
                        credentials     : 'include',           // need to DELETE `refreshToken` in the `http_only_cookie`
                        responseHandler : 'content-type',
                    }),
                    extraOptions: {
                        noAuth: true,
                    },
                    transformResponse(response, meta, forceLogout) {
                        // no need to store any data:
                        return undefined;
                    },
                    async onCacheEntryAdded(forceLogout = false, api) {
                        let loggedOut = false;
                        try {
                            // wait until the logout mutation is `fulfilled`:
                            await api.cacheDataLoaded;
                            loggedOut = true;
                        }
                        catch {
                            // logout failed
                        } // try
                        
                        
                        
                        if (loggedOut || forceLogout) {
                            // mark accessToken as loggedOut:
                            // an artificial `auth` api request to trigger: `pending` => `queryResultPatched` (if needed) => `fulfilled`:
                            await api.dispatch(
                                injectedAuthApiSlice.util.upsertQueryData('auth' as any, /* noParam: */ undefined, /* authentication: */ null /* = loggedOut */)
                            );
                        } // if
                    },
                }),
            }),
        })
    );
    
    
    
    // initialization:
    const apiMiddleware = injectedAuthApiSlice.middleware;
    injectedAuthApiSlice.middleware = (api) => {
        // setup:
        authApi = {
            // provides the callback for getting the auth data:
            getAccessToken      : async () => {
                const authentication = injectedAuthApiSlice.endpoints.auth.select(undefined)(api.getState() as any).data;
                if ((authentication === undefined) || (authentication === null)) return authentication;
                return config.selectAccessToken(authentication);
            },
            
            refreshAccessToken  : async () => {
                const processing  = api.dispatch(
                    injectedAuthApiSlice.endpoints.auth.initiate(undefined, { forceRefetch: true })
                );
                try {
                    const authentication = await processing.unwrap();
                    if ((authentication === undefined) || (authentication === null)) return authentication;
                    return config.selectAccessToken(authentication);
                }
                catch {
                    return undefined;
                }
                finally {
                    processing.unsubscribe();
                } // try
            },
            
            logout              : async (forceLogout) => {
                const processing  = api.dispatch(
                    injectedAuthApiSlice.endpoints.logout.initiate(forceLogout)
                );
                try {
                    return await processing.unwrap();
                }
                catch {
                    return undefined;
                }
                finally {
                    processing.reset();
                } // try
            },
        };
        
        
        
        // prefetch:
        const handleInit = () => {
            if (isClientSide) { // client side only
                Promise.resolve().then(() => { // prevents double `/refresh` request at startup by letting the (app) `useAuth()` hook to connect first
                    // prevents the `accessToken` cache data from being deleted by making a subscription by calling `dispatch(initiate())`:
                    // no need to `await`
                    api.dispatch(
                        injectedAuthApiSlice.endpoints.auth.initiate(undefined, { forceRefetch: false })
                    );
                    console.log('cleanup prevented');
                });
            } // if
            
            
            
            console.log('registered!');
        };
        
        
        
        // intercept the original_middleware:
        const actionTypeMiddlewareRegistered = injectedAuthApiSlice.internalActions.middlewareRegistered('').type;
        
        const apiNextDispatch = apiMiddleware(api);
        return (nextDispatch) => (action) => {
            const result = apiNextDispatch(nextDispatch)(action);
            
            
            
            if (action?.type === actionTypeMiddlewareRegistered) {
                handleInit();
            } // if
            
            
            
            return result;
        };
    };
    
    
    
    // custom hooks:
    const getPersistLogin = (): boolean => {
        // conditions:
        if (!isClientSide) return config.defaultPersistLogin;
        
        
        
        const value = localStorage.getItem(config.persistLoginKey);
        if ((value === undefined) || (value === null)) return config.defaultPersistLogin;
        return (value === 'true');
    };
    const setPersistLogin = (value: boolean|((oldValue: boolean) => boolean)): void => {
        // conditions:
        if (!isClientSide) return;
        
        
        
        localStorage.setItem(config.persistLoginKey, String(!!((typeof(value) === 'function') ? value(getPersistLogin()) : value)))
    };
    
    
    
    // rename the hooks to more human readable names:
    const {
        useAuthQuery      : useAuth,
        useLoginMutation  : useLogin,
        useLogoutMutation : useLogout,
    ...restInjectedAuthApiSlice} = injectedAuthApiSlice;
    
    // return the combined apiSlice:
    return {
        getPersistLogin,
        setPersistLogin,
        
        useAuth,
        useLogin,
        useLogout,
        ...restInjectedAuthApiSlice,
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
const injectHeaders = (headers: RawHeaders, accessToken: AccessToken): Headers => {
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
const injectArgs = (args: RawArgs, accessToken: AccessToken): FetchArgs => {
    const normalizedArgs = { ...normalizeArgs(args) }; // normalize & clone the args
    
    
    
    normalizedArgs.headers = injectHeaders(normalizedArgs.headers, accessToken);
    
    
    
    return normalizedArgs;
};



// fetch proxy:

export const fetchBaseQueryWithReauth = (baseQueryFn: ReturnType<typeof fetchBaseQuery>): ReturnType<typeof fetchBaseQuery> => {
    const interceptedBaseQueryFn : typeof baseQueryFn = async (args, api, extraOptions) => {
        // // TODO: remove this:
        // await new Promise<void>((resolve) => {
        //     setTimeout(() => {
        //         resolve();
        //     }, 10000);
        // });
        
        
        
        // the initial query:
        const forceNoAccessToken = ((extraOptions as any)?.['noAuth'] === true);
        let accessToken          = forceNoAccessToken ? undefined : (await authApi?.getAccessToken());
        let result               = await baseQueryFn(accessToken ? injectArgs(args, accessToken) : args, api, extraOptions);
        
        
        
        // re-auth:
        if (result.error && accessToken && authApi && authConfig && [authConfig.tokenExpiredStatus].flat().includes(result.error.status)) { // forbidden
            // re-generate accessToken:
            accessToken = await authApi.refreshAccessToken();
            if (accessToken) {
                // retry the initial query with a new accessToken:
                result  = await baseQueryFn(injectArgs(args, accessToken), api, extraOptions);
            }
            else {
                // failed to re-generate accessToken because the user was loggedOut or the refreshToken was expired
                // it's safe to `forceLogout` because the refreshToken is no longer valid
                await authApi.logout(/* forceLogout: */true);
            }
        } // if
        
        
        
        return result;
    };
    return interceptedBaseQueryFn;
};



// selectors:
export const selectUsername = (auth: Authentication): ReturnType<Required<AuthOptions>['selectUsername']> => {
    if (!authConfig) throw Error('`authApiSlice` was not configured');
    
    
    
    const accessToken = authConfig.selectAccessToken(auth);
    const decoded = jwt_decode(accessToken);
    if ((decoded === undefined) || (decoded === null)) throw Error('invalid data');
    
    
    
    return authConfig.selectUsername(decoded);
};
export const selectRoles = (auth: Authentication): ReturnType<Required<AuthOptions>['selectRoles']> => {
    if (!authConfig) throw Error('`authApiSlice` was not configured');
    
    
    
    const accessToken = authConfig.selectAccessToken(auth);
    const decoded = jwt_decode(accessToken);
    if ((decoded === undefined) || (decoded === null)) throw Error('invalid data');
    
    
    
    return authConfig.selectRoles(decoded);
};
