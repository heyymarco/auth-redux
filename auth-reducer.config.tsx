import React from 'react'
import Unauthorized from './pages/unauthorized'



export default {
    // auth server:
    authServerURL       : 'http://localhost:3001',
    tokenExpiredStatus  : 403,
    selectAccessToken   : (data: {}): string|Promise<string> => {
        const accessToken = (data as any)?.accessToken;
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
    persistLoginKey     : 'persistLogin',
    defaultPersistLogin : false,
    
    
    
    // pages:
    loginPage           : '/login',
    unauthorizedPage    : <Unauthorized />,
}