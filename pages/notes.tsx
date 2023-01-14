import Head from 'next/head'
import { Main } from '../components/Main'



export default function Notes() {
    return (
        <>
            <Head>
                <title>Notes</title>
                <meta name="description" content="the notes page" />
            </Head>
            <Main>
                <p>
                    Notes:
                </p>
                <ul>
                    <li>blah</li>
                    <li>blah</li>
                    <li>blah</li>
                </ul>
            </Main>
        </>
    );
}
