import type {
    Authentication,
    AccessToken,
    AuthOptions,
}                               from './store/features/auth/authApiSlice';



const options : AuthOptions = {
    // auth server:
    authServerURL       : 'http://localhost:3001',
    tokenExpiredStatus  : 403,
    
    selectAccessToken   : (auth: Authentication): AccessToken => {
        const accessToken = (auth as any)?.accessToken;
        if ((accessToken === undefined) || (accessToken === null)) throw Error('invalid data');
        return accessToken;
    },
    selectUsername      : (decoded: {}): (string|number) => {
        const username = (decoded as any)?.username;
        if ((username === undefined) || (username === null)) throw Error('invalid data');
        return username;
    },
    selectRoles         : (decoded: {}): (string|number)[] => {
        const roles = (decoded as any)?.username;
        if ((roles === undefined) || (roles === null)) throw Error('invalid data');
        if (!Array.isArray(roles)) return [roles];
        return roles;
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
};
export default options;
