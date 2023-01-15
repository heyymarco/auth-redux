import type {
    AuthOptions,
}                               from './store/features/auth/authApiSlice';



const options : AuthOptions = {
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
};
export default options;
