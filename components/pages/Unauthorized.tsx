import { Button } from '@reusable-ui/components';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { Main } from '../Main'



export default function Unauthorized() {
    const router = useRouter();
    
    
    
    return (
        <>
            <Head>
                <title>Unauthorized</title>
                <meta name="description" content="unauthorized" />
            </Head>
            <Main>
                <p>
                    You do not have access to the requested page.
                </p>
                <Button theme='primary' onClick={() => router.back()}>
                    Go Back
                </Button>
            </Main>
        </>
    );
}
