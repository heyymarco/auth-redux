import { Button } from '@reusable-ui/components';
import Head from 'next/head'
import { Main } from '../components/Main'
import { RequireAuth } from '../store/features/auth/RequireAuth'



export default function Posts() {
    // const [auth] = useAuth();
    const handleDelete = async () => {
        // try {
        //     // const response = await axios.delete('post', {
        //     //     headers         : { 'Content-Type': 'application/json' },
        //     //     withCredentials : true,
        //     // });
        //     const response = await auth?.axios?.delete('post');
        //     alert(`Delete success! Server message ${JSON.stringify(response?.data)}`);
        // }
        // catch (error) {
        //     alert(`Delete failed: ${error}`);
        // } // try
    };
    
    
    
    return (
        <RequireAuth roles={['admin', 'editor']}>
            <Head>
                <title>Posts</title>
                <meta name="description" content="the posts page" />
            </Head>
            <Main>
                <p>
                    Posts here...
                </p>
                <Button theme='danger' onClick={handleDelete}>
                    Delete
                </Button>
            </Main>
        </RequireAuth>
    );
}
