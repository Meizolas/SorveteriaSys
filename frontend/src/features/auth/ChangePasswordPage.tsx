import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiProblem } from '@/shared/api/problem';
import { changePassword } from './authApi';
import { useAuth } from './AuthProvider';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmation) { setMessage('As novas senhas não coincidem.'); return; }
    setBusy(true); setMessage('');
    try { await changePassword(currentPassword, newPassword); await auth.reload(); navigate('/'); }
    catch (error) { setMessage(error instanceof ApiProblem ? error.message : 'Não foi possível trocar a senha.'); }
    finally { setBusy(false); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); }
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography component="h1" variant="h4">Trocar senha</Typography>
      <Typography>Defina uma senha permanente para continuar.</Typography>
      {message && <Alert severity="error" role="alert" sx={{ mt: 2 }}>{message}</Alert>}
      <Box component="form" onSubmit={submit} sx={{ mt: 2 }} aria-busy={busy}>
        <TextField label="Senha atual" type="password" value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Nova senha" type="password" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} required fullWidth margin="normal"
          helperText="Use entre 12 e 128 caracteres."
          slotProps={{ htmlInput: { minLength: 12, maxLength: 128 } }} />
        <TextField label="Confirmar nova senha" type="password" value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)} required fullWidth margin="normal" />
        <Button type="submit" variant="contained" disabled={busy}>Salvar senha</Button>
      </Box>
    </Container>
  );
}

