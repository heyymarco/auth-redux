// react:
import {
    useEffect,
    useState,
}                               from 'react'

// redux toolkit:
import type {
    // fetches:
    BaseQueryFn,
    
    
    
    // RTK Query:
    Api,
    EndpointDefinitions,
}                               from '@reduxjs/toolkit/query'
import type {
    // modules:
    ModuleName,
}                               from '@reduxjs/toolkit/dist/query/apiTypes'

// internals:
import {
    injectAuthApiSlice as vanillaInjectAuthApiSlice,
    AuthOptions,
}                               from './authApiSlice'
export *                        from './authApiSlice'



export const injectAuthApiSlice = <
    TBaseQuery   extends BaseQueryFn,
    TDefinitions extends EndpointDefinitions,
    TReducerPath extends string,
    TTagTypes    extends string,
    TEnhancers   extends ModuleName
>(apiSlice: Api<TBaseQuery, TDefinitions, TReducerPath, TTagTypes, TEnhancers>, options?: AuthOptions) => {
    const injectedAuthApiSlice = vanillaInjectAuthApiSlice(apiSlice, options);
    
    
    
    // replace vanilla functions with react hooks:
    const {
        getPersistLogin,
        setPersistLogin : vanillaSetPersistLogin,
    ...restInjectedAuthApiSlice} = injectedAuthApiSlice;
    
    
    
    // custom hooks:
    const usePersistLogin = () => {
        // states:
        const persistLoginState = useState<boolean>(getPersistLogin);
        const [persistLogin] = persistLoginState;
        
        
        
        // watchdog:
        useEffect(() => {
            vanillaSetPersistLogin(persistLogin);
        }, [persistLogin]);
        
        
        
        // the react hook:
        return persistLoginState;
    };
    
    
    
    // return the combined apiSlice:
    return {
        usePersistLogin,
        
        ...restInjectedAuthApiSlice,
    };
};
