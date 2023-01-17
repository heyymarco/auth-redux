import { useRouter } from 'next/router';
import { useEffect } from 'react'



export default function RedirectLogin() {
    const router = useRouter();
    
    
    
    useEffect(() => {
        const loginPath = '/login';
        
        // buggy:
        // router.replace(loginPath, { query: { from: router.pathname } });
        
        // works:
        const from = router.pathname;
        router.replace(loginPath);
        const cancelRedirect = setTimeout(() => {
            router.replace(loginPath, { query: { from } });
        }, 100);
        
        
        
        // cleanups:
        return () => {
            clearTimeout(cancelRedirect);
        };
    }, []);
    
    
    
    return <></>;
}
