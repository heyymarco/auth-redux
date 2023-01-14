import Head from 'next/head'
import { Main } from '../components/Main'
import { RequireAuth } from '../store/features/auth/RequireAuth'



export default function Settings() {
    return (
        <RequireAuth roles={['admin']}>
            <Head>
                <title>Settings</title>
                <meta name="description" content="the setting page" />
            </Head>
            <Main>
                <p>
                    This is a setting page.
                </p>
            </Main>
        </RequireAuth>
    );
}
