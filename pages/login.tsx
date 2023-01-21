import { Button, Card, Form, CardHeader, Check, PasswordInput, TextInput, CardBody, CardFooter } from '@reusable-ui/components';
import Head from 'next/head'
import { Main } from '../components/Main'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Credential, useLogin, usePersistLogin } from '../store/features/api/apiSlice';
import axios from 'axios';



export default function Login() {
    const [login] = useLogin();
    const router = useRouter();
    const [enableValidation, setEnableValidation] = useState(false);
    const [persistLogin, setPersistLogin] = usePersistLogin();
    
    
    
    useEffect(() => {
        // conditions:
        if (!router.query) return;
        const { code, state } = router.query;
        if (!code || (typeof(code) !== 'string')) return;
        
        
        
        console.log('logging in....', { code, state });
        login({
            code,
            state : `${state}`,
        })
        .unwrap()
        .then(() => {
            alert('success: logged in with github')
            
            router.replace(new URLSearchParams(window.location.search).get('from') ?? '/');
        })
        .catch((error: any) => {
            alert(`login failed: ${error}`);
        });
    }, [router.query]);
    
    
    
    const handleSubmit : React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        setEnableValidation(true);
        if (!event.currentTarget.checkValidity()) return;
        
        
        
        const requestData = new FormData(event.currentTarget);
        try {
            await login(
                Object.fromEntries(requestData.entries()) as unknown as Credential
            ).unwrap();
            
            
            
            router.replace(new URLSearchParams(window.location.search).get('from') ?? '/');
        }
        catch (error) {
            alert(`login failed: ${error}`);
        } // try
    };
    const handleLoginWith = (provider: string) => {
        axios.get(`http://localhost:3001/login/${provider}`, { withCredentials: true }).then((response) => {
            const { authUrl } = response.data;
            if (!authUrl) return;
            window.location = authUrl;
        }).catch(() => {});
    }
    
    
    
    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="description" content="the login page" />
            </Head>
            <Main>
                <p>
                    Please login!
                </p>
                <Card theme='primary'>
                    <CardHeader>
                        Login
                    </CardHeader>
                    <CardBody>
                        <Form nude={true} noValidate enableValidation={enableValidation} onSubmit={handleSubmit}>
                            <TextInput name='username' required placeholder='username' />
                            <PasswordInput name='password' required placeholder='password' />
                            <Button type='submit'>Submit</Button>
                        </Form>
                    </CardBody>
                    <CardFooter>
                        <Check checkStyle='switch' active={persistLogin} onActiveChange={(event) => setPersistLogin(event.active)}>Trust this device</Check>
                    </CardFooter>
                </Card>
                <hr />
                <Button onClick={() => handleLoginWith('github')}>Login with GitHub</Button>
            </Main>
        </>
    );
}
