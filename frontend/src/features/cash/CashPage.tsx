import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { closeCash, createCashMovement, getCurrentCash, listClosedCashShifts, openCash, type CashView, type ClosedCashShiftView } from '@/shared/api/operationsApi';
import { EmptyState, MetricTile, SectionHeader } from '@/shared/ui/OperationalUi';
import { OperationIcon } from '@/shared/ui/OperationIcon';

type DialogType = 'open' | 'supply' | 'withdraw' | 'close' | null;

export function CashPage() {
  const [cash, setCash] = useState<CashView>();
  const [history, setHistory] = useState<ClosedCashShiftView[]>([]);
  const [lastClosed, setLastClosed] = useState<CashView>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<DialogType>(null);

  async function load() {
    setError('');
    try {
      const [current, closed] = await Promise.all([getCurrentCash(), listClosedCashShifts()]);
      setCash(current);
      setHistory(closed);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível consultar o caixa.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(value: number, reason: string) {
    if (!dialog) return;
    setError('');
    try {
      if (dialog === 'open') { setCash(await openCash(value)); setLastClosed(undefined); }
      if (dialog === 'supply') setCash(await createCashMovement('SUPPLY', value, reason));
      if (dialog === 'withdraw') setCash(await createCashMovement('WITHDRAWAL', value, reason));
      if (dialog === 'close') {
        const closed = await closeCash(value, reason || undefined);
        setLastClosed(closed);
        setCash(undefined);
        setHistory(await listClosedCashShifts());
      }
      setDialog(null);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível concluir a operação.');
    }
  }

  if (loading) return <Stack sx={{ alignItems: 'center', py: 10 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Consultando caixa…</Typography></Stack>;
  const open = cash?.status === 'OPEN';

  return <>
    <PageHeader title="Caixa" description="Turno atual e conferências anteriores"
      status={<Box sx={{ bgcolor: open ? 'success.main' : moduleColors.cash, color: '#fff', px: 2, py: 1, fontWeight: 900 }}>CAIXA {open ? 'ABERTO' : 'FECHADO'}</Box>} />
    {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

    {lastClosed && <ClosingSummary cash={lastClosed} onDismiss={() => setLastClosed(undefined)} />}
    {!cash ? <ClosedState onOpen={() => setDialog('open')} /> : <OpenShift cash={cash} onAction={setDialog} />}
    <CashHistory shifts={history} />

    <CashDialog key={dialog} type={dialog} expected={cash?.expectedAmount ?? 0}
      onClose={() => setDialog(null)} onConfirm={submit} />
  </>;
}

function ClosedState({ onOpen }: { onOpen: () => void }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', mb: 2 }}>
    <SectionHeader color={moduleColors.cash}><Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}><OperationIcon name="lock" />Caixa fechado</Stack></SectionHeader>
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 5, p: 2 }}><Typography>Abra o caixa para iniciar as vendas.</Typography><Button size="large" color="success" variant="contained" onClick={onOpen} startIcon={<OperationIcon name="pos" />} sx={{ mt: 2 }}>Abrir caixa</Button></Stack>
  </Box>;
}

function OpenShift({ cash, onAction }: { cash: CashView; onAction: (type: DialogType) => void }) {
  return <>
    <Grid container spacing={1}><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Saldo inicial" value={brl.format(cash.openingAmount)} icon="wallet" color="#477ba0" /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Vendas recebidas" value={brl.format(cash.salesTotal)} icon="receipt" color={moduleColors.pos} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Saldo esperado" value={brl.format(cash.expectedAmount)} icon="cash" color={moduleColors.products} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Turno" value={cash.code} icon="clock" color="#50616e" /></Grid></Grid>
    <Grid container spacing={1.5} sx={{ mt: .5, mb: 2 }}>
      <Grid size={{ xs: 12, md: 8 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader action={<Box sx={{ bgcolor: 'success.main', px: 2, py: .5, fontWeight: 900 }}>ABERTO</Box>}>Movimentações do turno</SectionHeader><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ p: 1.5, bgcolor: '#edf3f6', justifyContent: 'space-between' }}><Typography><b>Abertura:</b> {formatDateTime(cash.openedAt)}</Typography><Typography><b>Dinheiro em vendas:</b> {brl.format(cash.cashSales)}</Typography></Stack>{cash.movements.length === 0 ? <EmptyState icon="swap" title="Nenhuma movimentação" text="As movimentações aparecerão aqui." /> : <Stack>{cash.movements.map((item) => { const outgoing = item.type === 'WITHDRAWAL' || item.type === 'CASH_REFUND'; return <Stack key={item.id} direction="row" sx={{ px: 2, py: 1.5, gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}><OperationIcon name={outgoing ? 'minus' : 'plus'} /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{movementLabel(item.type)}</Typography><Typography variant="caption">{item.reason} · {formatDateTime(item.createdAt)}</Typography></Box><Typography sx={{ fontWeight: 900, color: outgoing ? 'error.main' : 'success.main' }}>{outgoing ? '- ' : '+ '}{brl.format(item.amount)}</Typography></Stack>; })}</Stack>}</Box></Grid>
      <Grid size={{ xs: 12, md: 4 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}><SectionHeader>Ações do caixa</SectionHeader><Stack sx={{ p: 1.5, gap: 1.5 }}><Button size="large" color="success" variant="contained" onClick={() => onAction('supply')} startIcon={<OperationIcon name="plus" />}>Registrar suprimento</Button><Button size="large" color="warning" variant="contained" onClick={() => onAction('withdraw')} startIcon={<OperationIcon name="minus" />}>Registrar sangria</Button><Button size="large" color="error" variant="contained" onClick={() => onAction('close')} startIcon={<OperationIcon name="lock" />}>Fechar caixa</Button><Box sx={{ bgcolor: '#eaf3f7', border: '1px solid #9db5c3', p: 1.5 }}><Typography variant="body2">Suprimentos: <b>{brl.format(cash.supplies)}</b></Typography><Typography variant="body2">Sangrias: <b>{brl.format(cash.withdrawals)}</b></Typography><Typography variant="body2">Estornos: <b>{brl.format(cash.refunds)}</b></Typography></Box></Stack></Box></Grid>
    </Grid>
  </>;
}

function ClosingSummary({ cash, onDismiss }: { cash: CashView; onDismiss: () => void }) {
  const difference = Number(cash.differenceAmount ?? 0);
  return <Box sx={{ bgcolor: '#fff', border: '2px solid', borderColor: difference === 0 ? 'success.main' : 'warning.main', mb: 2 }}>
    <SectionHeader color={difference === 0 ? '#2e7d32' : moduleColors.cash} action={<Button color="inherit" onClick={onDismiss}>Fechar resumo</Button>}>Caixa {cash.code} fechado com sucesso</SectionHeader>
    <Grid container spacing={1} sx={{ p: 1.5 }}><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Esperado" value={brl.format(cash.expectedAmount)} icon="wallet" color="#477ba0" /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Contado" value={brl.format(cash.countedAmount ?? 0)} icon="cash" color={moduleColors.products} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Diferença" value={brl.format(difference)} icon={difference === 0 ? 'check' : 'warning'} color={difference === 0 ? '#2e7d32' : moduleColors.stock} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Vendas" value={brl.format(cash.salesTotal)} icon="receipt" color={moduleColors.pos} /></Grid></Grid>
    <Typography sx={{ px: 2, pb: 2 }}><b>Fechado em:</b> {cash.closedAt ? formatDateTime(cash.closedAt) : '—'}{cash.closingReason ? <> · <b>Justificativa:</b> {cash.closingReason}</> : null}</Typography>
  </Box>;
}

function CashHistory({ shifts }: { shifts: ClosedCashShiftView[] }) {
  return <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
    <SectionHeader color="#50616e" action={<Typography sx={{ fontWeight: 900 }}>{shifts.length} FECHADOS</Typography>}>Histórico de caixas</SectionHeader>
    {shifts.length === 0 ? <EmptyState icon="clock" title="Nenhum caixa fechado" text="As conferências dos turnos aparecerão aqui." /> : <Stack>{shifts.map((shift) => <Box key={shift.id} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, alignItems: { md: 'center' } }}><Box sx={{ minWidth: 185 }}><Typography sx={{ fontWeight: 900, fontSize: 18 }}>{shift.code}</Typography><Typography variant="caption">{formatDateTime(shift.closedAt)} · {shift.operator}</Typography></Box><SummaryValue label="Vendas" value={shift.salesTotal} /><SummaryValue label="Esperado" value={shift.expectedAmount} /><SummaryValue label="Contado" value={shift.countedAmount} /><Box sx={{ minWidth: 130 }}><Typography variant="caption">Diferença</Typography><Typography sx={{ fontWeight: 900, color: Number(shift.differenceAmount) === 0 ? 'success.main' : 'error.main' }}>{brl.format(shift.differenceAmount)}</Typography></Box><Box sx={{ flex: 1 }}><Typography variant="caption">Justificativa</Typography><Typography>{shift.closingReason || 'Fechamento sem diferença'}</Typography></Box></Stack></Box>)}</Stack>}
  </Box>;
}

function SummaryValue({ label, value }: { label: string; value: number }) { return <Box sx={{ minWidth: 120 }}><Typography variant="caption">{label}</Typography><Typography sx={{ fontWeight: 900 }}>{brl.format(value)}</Typography></Box>; }
function movementLabel(type: string) { return ({ OPENING: 'Abertura', SUPPLY: 'Suprimento', WITHDRAWAL: 'Sangria', CASH_SALE: 'Venda em dinheiro', CASH_REFUND: 'Estorno de venda' } as Record<string, string>)[type] ?? type; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' }).format(new Date(value)); }

function CashDialog({ type, expected, onClose, onConfirm }: { type: DialogType; expected: number; onClose: () => void; onConfirm: (value: number, reason: string) => Promise<void> }) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  if (!type) return null;
  const labels = { open: ['Abrir caixa', 'Saldo inicial', 'Abrir turno'], supply: ['Registrar suprimento', 'Valor', 'Registrar'], withdraw: ['Registrar sangria', 'Valor', 'Registrar'], close: ['Fechar caixa', 'Valor contado', 'Conferir e fechar'] } as const;
  const amount = Number(value.replace(',', '.'));
  const needsReason = type === 'supply' || type === 'withdraw' || type === 'close' && Number.isFinite(amount) && amount !== expected;
  async function confirm() { setSaving(true); try { await onConfirm(amount, reason); } finally { setSaving(false); } }
  return <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs"><DialogTitle sx={{ bgcolor: type === 'close' ? moduleColors.cash : moduleColors.header, color: '#fff', fontWeight: 900 }}>{labels[type][0]}</DialogTitle><DialogContent><Stack sx={{ gap: 2, pt: 2 }}><TextField autoFocus label={labels[type][1]} value={value} onChange={(event) => setValue(event.target.value)} inputMode="decimal" helperText={type === 'close' ? `Saldo esperado: ${brl.format(expected)}` : undefined} />{type !== 'open' && <TextField label={type === 'close' ? 'Justificativa da diferença' : 'Motivo'} value={reason} onChange={(event) => setReason(event.target.value)} multiline rows={3} required={needsReason} slotProps={{ htmlInput: { maxLength: 240 } }} />}</Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={saving}>Cancelar</Button><Button variant="contained" disabled={saving || !Number.isFinite(amount) || amount < 0 || needsReason && !reason.trim()} onClick={() => void confirm()}>{saving ? 'Processando…' : labels[type][2]}</Button></DialogActions></Dialog>;
}
