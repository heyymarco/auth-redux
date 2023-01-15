import type React from 'react'
import config from '../../../auth-reducer.config'



// types:
export type HttpRequestMethod = 'GET'|'HEAD'|'POST'|'PUT'|'DELETE'|'CONNECT'|'OPTIONS'|'TRACE'|'PATCH'|(string & {});
export interface AuthConfig {
    // auth server:
    authServerURL       : string
    tokenExpiredStatus  : number|string|(number|string)[],
    parseAccessToken    : (response: unknown) => Promise<string>
    
    authRefreshPath     : string,
    authRefreshMethod   : HttpRequestMethod
    
    loginPath           : string
    loginMethod         : HttpRequestMethod
    
    logoutPath          : string
    logoutMethod        : HttpRequestMethod
    
    
    
    // behaviors:
    tagTypes            : string[],
    persistLoginKey     : string,
    defaultPersistLogin : boolean,
    
    
    
    // pages:
    loginPage           : string|React.ReactNode
    unauthorizedPage    : string|React.ReactNode,
}



const {
    // auth server:
    authServerURL       = 'http://localhost:3001',
    tokenExpiredStatus  = 403,
    parseAccessToken    = async (response: unknown): Promise<string> => {
        if (typeof(response) !== 'object') throw Error('invalid data');
        const accessToken = (response as any)?.accessToken;
        if (!accessToken) throw Error('invalid data');
        return accessToken;
    },
    
    authRefreshPath     = 'refresh',
    authRefreshMethod   = 'GET',
    
    loginPath           = '/login',
    loginMethod         = 'POST',
    
    logoutPath          = '/logout',
    logoutMethod        = 'POST',
    
    
    
    // behaviors:
    tagTypes            = ['Auth'],
    persistLoginKey     = 'persistLogin',
    defaultPersistLogin = false,
    
    
    
    // pages:
    loginPage           = undefined,
    unauthorizedPage    = undefined,
} = config;
export default {
    // auth server:
    authServerURL,
    tokenExpiredStatus,
    parseAccessToken,
    
    authRefreshPath,
    authRefreshMethod,
    
    loginPath,
    loginMethod,
    
    logoutPath,
    logoutMethod,
    
    
    
    // behaviors:
    tagTypes,
    persistLoginKey,
    defaultPersistLogin,
    
    
    
    // pages:
    loginPage,
    unauthorizedPage,
} as AuthConfig;
