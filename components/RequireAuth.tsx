import { RequireAuthProps, RequireAuth as BaseRequireAuth } from '../store/features/auth/RequireAuth'
import RedirectLogin from './pages/RedirectLogin';
import Unauthorized from './pages/Unauthorized';



export const RequireAuth = (props: RequireAuthProps) => {
    return (
        <BaseRequireAuth
            unauthenticatedPage = {props.unauthenticatedPage ?? <RedirectLogin />}
            unauthorizedPage    = {props.unauthorizedPage    ?? <Unauthorized /> }
        >
            {props.children}
        </BaseRequireAuth>
    );
}