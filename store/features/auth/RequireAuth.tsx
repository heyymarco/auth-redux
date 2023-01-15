import React, { useMemo } from 'react'
import { selectRoles, useAuth } from '../api/apiSlice';



export interface RequireAuthProps {
    // auth:
    /**
     * `undefined`           : public access.  
     * `[]`                  : all logged in users.  
     * `['admin']`           : only admins.  
     * `['admin', 'editor']` : only admins and editors.  
     */
    roles               ?: (string|number)[]
    
    
    
    // pages:
    unauthenticatedPage ?: React.ReactElement
    unauthorizedPage    ?: React.ReactElement
    
    
    
    // children:
    children            ?: React.ReactNode
}
export const RequireAuth = ({roles: requiredRoles, unauthenticatedPage, unauthorizedPage, children}: RequireAuthProps) => {
    const {isLoading, isError, data: auth} = useAuth();
    
    
    
    // security checks:
    const hasAccess = useMemo<null|boolean>(() => {
        if (requiredRoles) {
            // not logged in => unauthenticated:
            if (!auth) return null;
            
            
            
            // has any roles:
            if (requiredRoles.length) {
                // get the user role(s):
                const userRoles = selectRoles(auth);
                
                
                
                // the user must have one/more the required roles:
                if (requiredRoles.findIndex((requiredRole) => userRoles.includes(requiredRole)) < 0) return true;
            } // if
        } // if
        
        
        
        // all security checks passed:
        return true;
    }, [requiredRoles, auth]);
    
    if (hasAccess === null) return unauthenticatedPage ?? null;
    if (hasAccess !== true) return unauthorizedPage    ?? null;
    
    
    
    // all security checks passed:
    return (
        <>
            {children}
        </>
    );
};
