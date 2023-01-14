import { Button, Card, Form, CardHeader, Check, PasswordInput, TextInput, CardBody, CardFooter } from '@reusable-ui/components';
import Head from 'next/head'
import { Main } from '../components/Main'
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth, Credential, useLogin } from '../store/features/api/apiSlice';



export default function Login() {
    // const [login] = useAuth();
    const [login] = useLogin();
    const router = useRouter();
    const [enableValidation, setEnableValidation] = useState(false);
    
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
                        {/* <Check checkStyle='switch' active={Auth.persistLogin} onActiveChange={(event) => Auth.persistLogin = event.active}>Trust this device</Check> */}
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}
