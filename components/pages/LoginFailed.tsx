import { Button } from '@reusable-ui/components';
import Head from 'next/head'
import { useAuth } from '../../store/features/api/apiSlice';
import { Main } from '../Main'



export default function LoginFailed() {
    const {refetch} = useAuth();
    
    
    
    return (
        <>
            <Head>
                <title>Error</title>
                <meta name="description" content="Login" />
            </Head>
            <Main>
                <p>
                    Login failed!
                </p>
                <Button theme='success' onClick={() => refetch()}>
                    Retry
                </Button>
            </Main>
        </>
    );
}
