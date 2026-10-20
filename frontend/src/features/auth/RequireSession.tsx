import { Alert, CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export function RequireSession() {
  const auth = useAuth();
  const location = useLocation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!auth.session) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [auth.session]);
  const nearExpiry = auth.session
    ? new Date(auth.session.absoluteExpiresAt).getTime() - now <= 5 * 60_000
    : false;
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
