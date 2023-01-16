import { RequireAuthProps, RequireAuth as BaseRequireAuth } from '../store/features/auth/RequireAuth'
import LoggingIn from './pages/LoggingIn';
import LoginFailed from './pages/LoginFailed';
import RedirectLogin from './pages/RedirectLogin';
import Unauthorized from './pages/Unauthorized';



export const RequireAuth = (props: RequireAuthProps) => {
    return (
        <BaseRequireAuth
            loadingPage         = {props.loadingPage         ?? <LoggingIn />    }
            errorPage           = {props.errorPage           ?? <LoginFailed />  }
            unauthenticatedPage = {props.unauthenticatedPage ?? <RedirectLogin />}
            unauthorizedPage    = {props.unauthorizedPage    ?? <Unauthorized /> }
        >
            {props.children}
        </BaseRequireAuth>
    );
}