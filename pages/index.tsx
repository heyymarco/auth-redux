import Head from 'next/head'
import { Main } from '../components/Main'



export default function Home() {
    return (
        <>
            <Head>
                <title>Home</title>
                <meta name="description" content="the homepage" />
            </Head>
            <Main>
                <p>
                    Welcome to my site!
                </p>
            </Main>
        </>
    );
}
