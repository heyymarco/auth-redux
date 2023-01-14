import React from 'react'
import { useAuth } from '../api/apiSlice';



export interface RequireAuthProps {
    roles    ?: string[]
    children ?: React.ReactNode
}
export const RequireAuth = ({roles: requiredRoles, children}: RequireAuthProps) => {
    const [authenticate, {isUninitialized, isLoading, isSuccess, isError, data: auth}] = useAuth();
    
    console.log({isUninitialized, isLoading, isSuccess, isError, auth});
    
    return (
        <>
            {children}
        </>
    )
};
