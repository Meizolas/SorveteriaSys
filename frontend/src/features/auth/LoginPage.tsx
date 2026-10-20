import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiProblem } from '@/shared/api/problem';
import { useAuth } from './AuthProvider';

export function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const session = await auth.signIn(login, password);
      setPassword('');
      navigate(session.user.mustChangePassword ? '/trocar-senha' : '/');
    } catch (error) {
      setMessage(error instanceof ApiProblem ? error.message : 'Não foi possível entrar.');
    } finally { setBusy(false); }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <Typography component="h1" variant="h4">Entrar</Typography>
      {message && <Alert severity="error" role="alert" sx={{ mt: 2 }}>{message}</Alert>}
      <Box component="form" onSubmit={submit} noValidate sx={{ mt: 2 }} aria-busy={busy}>
        <TextField label="Usuário" value={login} onChange={(e) => setLogin(e.target.value)}
          autoComplete="username" required fullWidth margin="normal" autoFocus />
        <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" required fullWidth margin="normal" />
        <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ mt: 2 }}>
          {busy ? <CircularProgress size={24} aria-label="Entrando" /> : 'Entrar'}
        </Button>
      </Box>
    </Container>
  );
}

