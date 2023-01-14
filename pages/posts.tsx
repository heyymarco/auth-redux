import { Button } from '@reusable-ui/components';
import Head from 'next/head'
import { Main } from '../components/Main'
import { RequireAuth } from '../store/features/auth/RequireAuth'
import { usePostMutation } from '../store/features/api/apiSlice';



export default function Posts() {
    const [deletePost, { isLoading }] = usePostMutation();
    const handleDelete = async () => {
        try {
            await deletePost(undefined).unwrap();
            alert(`Delete success!`);
        }
        catch (error) {
            alert(`Delete failed: ${error}`);
        } // try
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
                <Button theme='danger' onClick={handleDelete} enabled={!isLoading}>
                    Delete
                </Button>
            </Main>
        </RequireAuth>
    );
}
