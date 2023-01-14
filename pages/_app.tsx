import '../libs/cssfn-preload'
import '@cssfn/cssfn-dom'

import { globalScope, rule, styleSheets } from '@cssfn/core'

import '../styles/globals.css'

import { Provider } from 'react-redux'
import { store } from '../store/store'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import Link from 'next/link'

import { Collapse, HamburgerMenuButton, Nav, Navbar, NavItem } from '@reusable-ui/components';



styleSheets([
    globalScope({
        ...rule('body', {
            // layouts:
            display: 'block',
        }, { specificityWeight: 2 }),
    }),
]);



const Header = () => {
    return (
        <>
            <Head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            
            <header>
                <Navbar theme='primary' gradient={true} className='siteNavbar' breakpoint='sm'>{({
                    basicVariantProps,
                    navbarExpanded,
                    listExpanded,
                    handleClickToToggleList,
                }) =>
                    <>
                        {!navbarExpanded && <HamburgerMenuButton {...basicVariantProps} className='toggler' active={listExpanded} onClick={handleClickToToggleList} />}
                        
                        <Collapse className='list' mainClass={navbarExpanded ? '' : undefined} expanded={listExpanded}>
                            <Nav tag='ul' role='' {...basicVariantProps} orientation={navbarExpanded ? 'inline' : 'block'} listStyle='flat' gradient={navbarExpanded ? 'inherit' : false}>
                                <NavItem><Link href='/'>Home</Link></NavItem>
                                <NavItem><Link href='/notes'>Notes</Link></NavItem>
                                <NavItem><Link href='/posts'>Posts</Link></NavItem>
                                <NavItem><Link href='/settings'>Settings</Link></NavItem>
                                <NavItem><Link href='/login'>Login</Link></NavItem>
                            </Nav>
                        </Collapse>
                    </>
                }</Navbar>
            </header>
        </>
    );
};
const Footer = () => {
    return (
        <footer>
        </footer>
    );
}



export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <Header />
            <Component {...pageProps} />
            <Footer />
        </Provider>
    );
}
