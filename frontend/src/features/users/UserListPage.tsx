import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, InputAdornment, Snackbar, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import type { Role, RoleCode, User } from '@/shared/api/generated';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import * as api from './usersApi';

type Form = {
  login: string; displayName: string; password: string; active: boolean; roles: RoleCode[];
};
const emptyForm = (): Form => ({
  login: '', displayName: '', password: '', active: true, roles: ['OPERATOR']
});

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [dialog, setDialog] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [userItems, roleItems] = await Promise.all([api.listUsers(), api.listRoles()]);
      setUsers(userItems); setRoles(roleItems);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível carregar os usuários.');
    }
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => users.filter((user) =>
    `${user.displayName} ${user.login}`.toLowerCase().includes(query.toLowerCase())), [query, users]);
  const active = users.filter((user) => user.active).length;
  const administrators = users.filter((user) => user.roles.includes('ADMINISTRATOR')).length;

  function openCreate() {
    setEditing(null); setForm(emptyForm()); setDialog(true);
  }
  function openEdit(user: User) {
    setEditing(user);
    setForm({ login: user.login, displayName: user.displayName, password: '',
      active: user.active, roles: user.roles });
    setDialog(true);
  }
  function toggleRole(code: RoleCode, checked: boolean) {
    setForm((current) => ({ ...current, roles: checked
      ? [...current.roles, code] : current.roles.filter((item) => item !== code) }));
  }
  async function save() {
    if (!form.login.trim() || !form.displayName.trim() || form.roles.length === 0
      || (!editing && form.password.length < 12)) {
      setError('Preencha nome, login, perfil e uma senha temporária de ao menos 12 caracteres.');
      return;
    }
    setSaving(true); setError('');
    try {
      if (editing) {
        await api.updateUser(editing.id, { login: form.login.trim(),
          displayName: form.displayName.trim(), active: form.active, roles: form.roles,
          version: editing.version });
        setNotice('Usuário atualizado com sucesso.');
      } else {
        await api.createUser({ login: form.login.trim(), displayName: form.displayName.trim(),
          temporaryPassword: form.password, roles: form.roles });
        setNotice('Usuário criado. A senha temporária vence em 24 horas.');
      }
      setDialog(false); await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível salvar o usuário.');
    } finally { setSaving(false); }
  }
  async function resetAccess() {
    if (!resetTarget || resetPassword.length < 12) {
      setError('A senha temporária deve ter ao menos 12 caracteres.'); return;
    }
    setSaving(true); setError('');
    try {
      await api.resetTemporaryPassword(resetTarget.id, resetPassword);
      setNotice('Novo acesso temporário emitido e sessões anteriores revogadas.');
      setResetTarget(null); setResetPassword(''); await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível redefinir o acesso.');
    } finally { setSaving(false); }
  }

  return <>
    <PageHeader title="Usuários" description="Acessos e perfis da equipe"
      action={<Button variant="contained" color="success" size="large" onClick={openCreate}
        startIcon={<OperationIcon name="plus" />}>Novo usuário</Button>} />
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, mb: 2 }}>
      <Metric label="Cadastrados" value={users.length} /><Metric label="Ativos" value={active} />
      <Metric label="Administradores" value={administrators} />
    </Stack>
    <TextField fullWidth value={query} onChange={(event) => setQuery(event.target.value)}
      placeholder="Buscar por nome ou login" sx={{ mb: 1.5 }}
      slotProps={{ input: { startAdornment: <InputAdornment position="start"><OperationIcon name="search" /></InputAdornment> } }} />
    <TableContainer sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
      <Table><TableHead><TableRow><TableCell>Usuário</TableCell><TableCell>Perfil</TableCell>
        <TableCell>Acesso</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
        <TableBody>{filtered.map((user) => <TableRow key={user.id} hover>
          <TableCell><Typography sx={{ fontWeight: 900 }}>{user.displayName}</Typography>
            <Typography variant="caption">@{user.login}</Typography></TableCell>
          <TableCell><RoleChips user={user} /></TableCell>
          <TableCell>{user.mustChangePassword ? <Chip color="warning" label="Troca pendente" />
            : <Chip color="success" variant="outlined" label="Definitivo" />}</TableCell>
          <TableCell><Chip color={user.active ? 'success' : 'default'} label={user.active ? 'ATIVO' : 'INATIVO'} /></TableCell>
          <TableCell><Stack direction="row" sx={{ gap: 1 }}><Button variant="contained" onClick={() => openEdit(user)}
            startIcon={<OperationIcon name="edit" />}>Editar</Button>
            <Button variant="outlined" onClick={() => { setResetTarget(user); setResetPassword(''); }}
              startIcon={<OperationIcon name="lock" />}>Redefinir senha</Button></Stack></TableCell>
        </TableRow>)}</TableBody></Table>
    </TableContainer>
    <Stack sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>{filtered.map((user) =>
      <Box key={user.id} sx={{ bgcolor: '#fff', p: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}><OperationIcon name="user" size={42} />
          <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{user.displayName}</Typography>
            <Typography variant="caption">@{user.login}</Typography></Box>
          <Chip color={user.active ? 'success' : 'default'} label={user.active ? 'ATIVO' : 'INATIVO'} /></Stack>
        <Box sx={{ my: 1 }}><RoleChips user={user} /></Box>
        <Stack direction="row" sx={{ gap: 1 }}><Button fullWidth variant="contained" onClick={() => openEdit(user)}>Editar</Button>
          <Button fullWidth variant="outlined" onClick={() => { setResetTarget(user); setResetPassword(''); }}>Senha</Button></Stack>
      </Box>)}</Stack>
    <UserDialog open={dialog} editing={editing} roles={roles} form={form} saving={saving}
      setForm={setForm} toggleRole={toggleRole} onClose={() => !saving && setDialog(false)} onSave={() => void save()} />
    <Dialog open={Boolean(resetTarget)} onClose={() => !saving && setResetTarget(null)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ bgcolor: '#123849', color: '#fff', fontWeight: 900 }}>Redefinir senha temporária</DialogTitle>
      <DialogContent><Stack sx={{ gap: 2, pt: 2 }}><Typography>Defina o novo acesso de <b>{resetTarget?.displayName}</b>.</Typography>
        <TextField autoFocus label="Nova senha temporária" type="password" value={resetPassword}
          onChange={(event) => setResetPassword(event.target.value)} helperText="Entre 12 e 128 caracteres; validade de 24 horas."
          slotProps={{ htmlInput: { minLength: 12, maxLength: 128 } }} /></Stack></DialogContent>
      <DialogActions><Button onClick={() => setResetTarget(null)} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={() => void resetAccess()} disabled={saving || resetPassword.length < 12}>Emitir novo acesso</Button></DialogActions>
    </Dialog>
    <Snackbar open={Boolean(notice || error)} autoHideDuration={4000} onClose={() => { setNotice(''); setError(''); }}>
      <Alert severity={error ? 'error' : 'success'}>{error || notice}</Alert>
    </Snackbar>
  </>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Box sx={{ bgcolor: '#fff', borderLeft: '6px solid #0877e8', px: 2, py: 1.2, minWidth: 170 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{label.toUpperCase()}</Typography>
    <Typography variant="h5" sx={{ fontWeight: 900 }}>{value}</Typography></Box>;
}

function RoleChips({ user }: { user: User }) {
  return <Stack direction="row" sx={{ gap: .5, flexWrap: 'wrap' }}>{user.roles.map((role) =>
    <Chip key={role} color={role === 'ADMINISTRATOR' ? 'primary' : 'default'}
      label={role === 'ADMINISTRATOR' ? 'Administrador' : 'Operador'} />)}</Stack>;
}

function UserDialog({ open, editing, roles, form, saving, setForm, toggleRole, onClose, onSave }: {
  open: boolean; editing: User | null; roles: Role[]; form: Form; saving: boolean;
  setForm: (form: Form) => void; toggleRole: (code: RoleCode, checked: boolean) => void;
  onClose: () => void; onSave: () => void;
}) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ bgcolor: '#123849', color: '#fff', fontWeight: 900 }}>{editing ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
    <DialogContent><Stack sx={{ gap: 2, pt: 2 }}>
      <TextField autoFocus label="Nome" value={form.displayName} required
        onChange={(event) => setForm({ ...form, displayName: event.target.value })} slotProps={{ htmlInput: { maxLength: 120 } }} />
      <TextField label="Login" value={form.login} required helperText="3 a 64 caracteres: letras, números, ponto, hífen ou sublinhado."
        onChange={(event) => setForm({ ...form, login: event.target.value })} slotProps={{ htmlInput: { maxLength: 64 } }} />
      {!editing && <TextField label="Senha temporária" type="password" value={form.password} required
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        helperText="O usuário deverá trocá-la no primeiro acesso; validade de 24 horas."
        slotProps={{ htmlInput: { minLength: 12, maxLength: 128 } }} />}
      <Box><Typography sx={{ fontWeight: 900, mb: .5 }}>Perfis</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }}>{roles.map((role) => <FormControlLabel key={role.code}
          control={<Checkbox checked={form.roles.includes(role.code)} onChange={(event) => toggleRole(role.code, event.target.checked)} />}
          label={role.displayName} />)}</Stack></Box>
      {editing && <FormControlLabel control={<Switch checked={form.active}
        onChange={(event) => setForm({ ...form, active: event.target.checked })} />} label="Usuário ativo" />}
      <Alert severity="info">Alterações de perfil, status ou senha revogam as sessões anteriores.</Alert>
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Cancelar</Button>
      <Button variant="contained" onClick={onSave} disabled={saving || !form.login.trim() || !form.displayName.trim()
        || form.roles.length === 0 || (!editing && form.password.length < 12)}>{saving ? 'Salvando…' : 'Salvar'}</Button></DialogActions>
  </Dialog>;
}
