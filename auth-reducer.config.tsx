import React from 'react'
import Unauthorized from './pages/unauthorized'



export default {
    // auth server:
    authServerURL       : 'http://localhost:3001',
    tokenExpiredStatus  : 403,
    parseAccessToken    : async (response: unknown): Promise<string> => {
        if (typeof(response) !== 'object') throw Error('invalid data');
        const accessToken = (response as any)?.accessToken;
        if (!accessToken) throw Error('invalid data');
        return accessToken;
    },
    
    authRefreshPath     : '/refresh',
    authRefreshMethod   : 'POST',
    
    loginPath           : '/login',
    loginMethod         : 'POST',
    
    logoutPath          : '/logout',
    logoutMethod        : 'POST',
    
    
    
    // behaviors:
    tagTypes            : ['Auth'],
    persistLoginKey     : 'persistLogin',
    defaultPersistLogin : false,
    
    
    
    // pages:
    loginPage           : '/login',
    unauthorizedPage    : <Unauthorized />,
}