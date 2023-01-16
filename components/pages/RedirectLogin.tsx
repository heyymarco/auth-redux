import { useRouter } from 'next/router';
import { useEffect } from 'react'



export default function RedirectLogin() {
    const router = useRouter();
    
    
    
    useEffect(() => {
        const loginPath = '/login';
        
        // buggy:
        // router.replace(loginPath, { query: { from: router.pathname } });
        
        // works:
        router.replace(loginPath);
        const cancelRedirect = setTimeout(() => {
            router.replace(loginPath, { query: { from: router.pathname } });
        }, 0);
        
        
        
        // cleanups:
        return () => {
            clearTimeout(cancelRedirect);
        };
    }, []);
    
    
    
    return <></>;
}
