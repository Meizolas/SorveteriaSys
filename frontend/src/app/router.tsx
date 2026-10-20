import { Navigate, createBrowserRouter } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';
import { RequireSession } from '@/features/auth/RequireSession';
import { OperatorHomePage } from './OperatorHomePage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/trocar-senha', element: <ChangePasswordPage /> },
  {
    element: <RequireSession />,
    children: [{ path: '/', element: <OperatorHomePage /> }]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

