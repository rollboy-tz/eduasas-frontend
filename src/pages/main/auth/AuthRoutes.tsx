import {
    AuthLayout,
    LoginPage,
    RegisterPage,
    PasswordPage,
    VerifyPage,
} from './';

export const AuthRoutes = [
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/password", element: <PasswordPage /> },
            { path: "/verify", element: <VerifyPage /> }
        ]
    }

]