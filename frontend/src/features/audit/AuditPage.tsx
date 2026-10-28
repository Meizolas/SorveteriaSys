import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
  Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import type { AuditEvent, AuditOutcome } from '@/shared/api/generated';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import * as api from './auditApi';

const actionLabels: Record<string, string> = {
  INITIAL_ADMIN_PROVISIONED: 'Administrador inicial criado', USER_CREATED: 'Usuário criado',
  USER_UPDATED: 'Usuário alterado', TEMPORARY_PASSWORD_ISSUED: 'Senha temporária emitida',
  STORE_CREATED: 'Loja configurada', STORE_UPDATED: 'Configuração da loja alterada',
  AUTHENTICATION_SUCCEEDED: 'Entrada realizada', AUTHENTICATION_FAILED: 'Entrada negada',
  AUTHENTICATION_THROTTLED: 'Entrada bloqueada temporariamente', LOGOUT: 'Saída realizada',
  PASSWORD_CHANGED: 'Senha alterada'
};
const outcomeLabels: Record<AuditOutcome, string> = {
  SUCCEEDED: 'Concluído', DENIED: 'Negado', FAILED: 'Falhou'
};

function dateValue(date: Date) { return date.toISOString().slice(0, 10); }
function initialFrom() { const value = new Date(); value.setDate(value.getDate() - 30); return dateValue(value); }

export function AuditPage() {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(() => dateValue(new Date()));
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('');
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(cursor?: string, append = false) {
    setLoading(true); setError('');
    try {
      const page = await api.listAuditEvents({ occurredFrom: `${from}T00:00:00-03:00`,
        occurredTo: `${to}T23:59:59.999-03:00`,
        ...(actor.trim() ? { actorUserId: actor.trim() } : {}),
        ...(action ? { action } : {}), ...(outcome ? { outcome: outcome as AuditOutcome } : {}),
        ...(cursor ? { cursor } : {}), limit: 30 });
      setItems((current) => append ? [...current, ...page.items] : page.items);
      setNextCursor(page.nextCursor);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível consultar a auditoria.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>
    <PageHeader title="Auditoria" description="Histórico imutável das ações administrativas"
      status={<Box sx={{ bgcolor: '#dbe4ea', px: 2, py: 1, fontWeight: 900 }}>SOMENTE LEITURA</Box>}
      action={<Button variant="contained" size="large" disabled={loading} onClick={() => void load()}
        startIcon={<OperationIcon name="search" />}>{loading ? 'Consultando…' : 'Consultar'}</Button>} />
    <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5 }}>
        <TextField label="Data inicial" type="date" value={from} onChange={(event) => setFrom(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Data final" type="date" value={to} onChange={(event) => setTo(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="ID do responsável" value={actor} onChange={(event) => setActor(event.target.value)}
          inputMode="numeric" sx={{ minWidth: 170 }} />
        <TextField select label="Ação" value={action} onChange={(event) => setAction(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Todas</MenuItem>{Object.entries(actionLabels).map(([code, label]) =>
            <MenuItem key={code} value={code}>{label}</MenuItem>)}</TextField>
        <TextField select label="Resultado" value={outcome} onChange={(event) => setOutcome(event.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>{Object.entries(outcomeLabels).map(([code, label]) =>
            <MenuItem key={code} value={code}>{label}</MenuItem>)}</TextField>
      </Stack>
    </Box>
    <Typography sx={{ fontWeight: 800, mb: 1 }}>{items.length} eventos carregados</Typography>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
      <Table><TableHead><TableRow><TableCell>Data e hora</TableCell><TableCell>Ação</TableCell>
        <TableCell>Responsável</TableCell><TableCell>Alvo</TableCell><TableCell>Resultado</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>{items.map((event) => <TableRow key={event.id} hover>
          <TableCell>{formatDate(event.occurredAt)}</TableCell>
          <TableCell><Typography sx={{ fontWeight: 900 }}>{labelAction(event.action)}</Typography><Typography variant="caption">{event.action}</Typography></TableCell>
          <TableCell>{event.actorName ?? 'Sistema'}<Typography variant="caption" sx={{ display: 'block' }}>{event.actorLogin ? `@${event.actorLogin}` : event.origin}</Typography></TableCell>
          <TableCell>{event.targetType ? `${event.targetType} #${event.targetId ?? '—'}` : '—'}</TableCell>
          <TableCell><OutcomeChip value={event.outcome} /></TableCell>
          <TableCell><Button variant="outlined" onClick={() => setSelected(event)} startIcon={<OperationIcon name="zoom" />}>Detalhes</Button></TableCell>
        </TableRow>)}</TableBody></Table>
    </TableContainer>
    <Stack sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>{items.map((event) =>
      <Box key={event.id} sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}><Typography variant="caption">{formatDate(event.occurredAt)}</Typography><OutcomeChip value={event.outcome} /></Stack>
        <Typography sx={{ fontWeight: 900, mt: 1 }}>{labelAction(event.action)}</Typography>
        <Typography>{event.actorName ?? 'Sistema'} · {event.targetType ?? 'Sessão'}</Typography>
        <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={() => setSelected(event)}>Ver detalhes</Button>
      </Box>)}</Stack>
    {nextCursor && <Button fullWidth variant="outlined" sx={{ mt: 2 }} disabled={loading}
      onClick={() => void load(nextCursor, true)}>Carregar mais eventos</Button>}
    {!loading && items.length === 0 && <Alert severity="info">Nenhum evento encontrado para os filtros informados.</Alert>}
    <AuditDetail event={selected} onClose={() => setSelected(null)} />
    <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError('')}>
      <Alert severity="error">{error}</Alert>
    </Snackbar>
  </>;
}

function OutcomeChip({ value }: { value: AuditOutcome }) {
  const color = value === 'SUCCEEDED' ? 'success' : value === 'DENIED' ? 'warning' : 'error';
  return <Chip color={color} label={outcomeLabels[value]} />;
}
function labelAction(action: string) { return actionLabels[action] ?? action.replaceAll('_', ' '); }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Bahia' }).format(new Date(value)); }

function AuditDetail({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  return <Dialog open={Boolean(event)} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle sx={{ bgcolor: '#123849', color: '#fff', fontWeight: 900 }}>Detalhes do evento</DialogTitle>
    <DialogContent><Stack sx={{ gap: 2, pt: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}><Info label="Ação" value={event ? labelAction(event.action) : ''} /><Info label="Resultado" value={event ? outcomeLabels[event.outcome] : ''} /><Info label="Data" value={event ? formatDate(event.occurredAt) : ''} /></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}><Info label="Responsável" value={event?.actorName ?? 'Sistema'} /><Info label="Origem" value={event?.origin ?? ''} /><Info label="Alvo" value={event?.targetType ? `${event.targetType} #${event.targetId ?? '—'}` : '—'} /></Stack>
      <Info label="Correlação" value={event?.correlationId ?? ''} />
      {event?.reason && <Info label="Motivo" value={event.reason} />}
      <Typography variant="h6">Alterações registradas</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}><ChangeBox title="Antes" value={event?.changes.before ?? {}} /><ChangeBox title="Depois" value={event?.changes.after ?? {}} /></Stack>
      <Alert severity="info">Este registro é imutável e não pode ser editado ou excluído pela aplicação.</Alert>
    </Stack></DialogContent><DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
  </Dialog>;
}
function Info({ label, value }: { label: string; value: string }) { return <Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>{label.toUpperCase()}</Typography><Typography sx={{ overflowWrap: 'anywhere' }}>{value || '—'}</Typography></Box>; }
function ChangeBox({ title, value }: { title: string; value: Record<string, unknown> }) { return <Box sx={{ flex: 1, bgcolor: '#f4f8fa', border: '1px solid', borderColor: 'divider', p: 2 }}><Typography sx={{ fontWeight: 900, mb: 1 }}>{title}</Typography>{Object.keys(value).length ? Object.entries(value).map(([key, item]) => <Typography key={key} sx={{ overflowWrap: 'anywhere' }}><b>{key}:</b> {String(item)}</Typography>) : <Typography color="text.secondary">Sem dados</Typography>}</Box>; }
