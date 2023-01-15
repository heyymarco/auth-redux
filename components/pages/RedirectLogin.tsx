import { useRouter } from 'next/router';
import { useEffect } from 'react'



export default function RedirectLogin() {
    const router = useRouter();
    
    
    
    useEffect(() => {
        const loginPath = '/login';
        
        // buggy:
        // router.replace(loginPath, { query: { from: router.pathname } });
        
        // works:
        if (typeof(window) !== 'undefined') router.replace(loginPath);
        router.replace(loginPath, { query: { from: router.pathname } });
    }, []);
    
    
    
    return <></>;
}
