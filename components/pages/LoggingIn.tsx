import Head from 'next/head'
import { Main } from '../Main'



export default function LoggingIn() {
    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="description" content="Login" />
            </Head>
            <Main>
                <p>
                    Logging in...
                </p>
            </Main>
        </>
    );
}
