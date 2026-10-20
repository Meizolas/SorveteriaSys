import { Alert, CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export function RequireSession() {
  const auth = useAuth();
  const location = useLocation();
  const [nearExpiry, setNearExpiry] = useState(false);
  useEffect(() => {
    if (!auth.session) { setNearExpiry(false); return; }
    const check = () => setNearExpiry(new Date(auth.session!.absoluteExpiresAt).getTime() - Date.now() <= 5 * 60_000);
    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [auth.session]);
  if (auth.loading) return <Container sx={{ py: 6 }}><CircularProgress aria-label="Verificando sessão" /></Container>;
  if (!auth.session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (auth.session.user.mustChangePassword && location.pathname !== '/trocar-senha') {
    return <Navigate to="/trocar-senha" replace />;
  }
  return (
    <>
      {nearExpiry && <Alert severity="warning">Sua sessão expirará em breve.</Alert>}
      <Outlet />
    </>
  );
}
