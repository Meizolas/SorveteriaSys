import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { closeCash, createCashMovement, getCurrentCash, openCash, type CashView } from '@/shared/api/operationsApi';
import { EmptyState, MetricTile, SectionHeader } from '@/shared/ui/OperationalUi';
import { OperationIcon } from '@/shared/ui/OperationIcon';

type DialogType = 'open' | 'supply' | 'withdraw' | 'close' | null;

export function CashPage() {
  const [cash, setCash] = useState<CashView>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<DialogType>(null);

  useEffect(() => {
    void getCurrentCash().then(setCash).catch((value: unknown) =>
      setError(value instanceof Error ? value.message : 'Não foi possível consultar o caixa.'))
      .finally(() => setLoading(false));
  }, []);

  async function submit(value: number, reason: string) {
    if (!dialog) return;
    setError('');
    try {
      if (dialog === 'open') setCash(await openCash(value));
      if (dialog === 'supply') setCash(await createCashMovement('SUPPLY', value, reason));
      if (dialog === 'withdraw') setCash(await createCashMovement('WITHDRAWAL', value, reason));
      if (dialog === 'close') {
        await closeCash(value, reason || undefined);
        setCash(undefined);
      }
      setDialog(null);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível concluir a operação.');
    }
  }

  if (loading) return <Stack sx={{ alignItems: 'center', py: 10 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Consultando caixa…</Typography></Stack>;
  const open = cash?.status === 'OPEN';
  return <>
    <PageHeader title="Caixa" status={<Box sx={{ bgcolor: open ? 'success.main' : moduleColors.cash, color: '#fff', px: 2, py: 1, fontWeight: 900 }}>CAIXA {open ? 'ABERTO' : 'FECHADO'}</Box>} />
    {error && <Box role="alert" sx={{ bgcolor: '#ffe0e0', border: '1px solid', borderColor: 'error.main', p: 1.5, mb: 1 }}>{error}</Box>}
    {!cash ? <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
      <SectionHeader color={moduleColors.cash}><Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}><OperationIcon name="lock" />Caixa fechado</Stack></SectionHeader>
      <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 7, p: 2 }}><Typography>Abra o caixa para iniciar as vendas.</Typography><Button size="large" color="success" variant="contained" onClick={() => setDialog('open')} startIcon={<OperationIcon name="pos" />} sx={{ mt: 2 }}>Abrir caixa</Button></Stack>
    </Box> : <>
      <Grid container spacing={1}><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Saldo inicial" value={brl.format(cash.openingAmount)} icon="wallet" color="#477ba0" /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Vendas recebidas" value={brl.format(cash.salesTotal)} icon="receipt" color={moduleColors.pos} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Saldo esperado" value={brl.format(cash.expectedAmount)} icon="cash" color={moduleColors.products} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Turno" value={cash.code} icon="clock" color="#50616e" /></Grid></Grid>
      <Grid container spacing={1.5} sx={{ mt: .5 }}><Grid size={{ xs: 12, md: 8 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader action={<Box sx={{ bgcolor: 'success.main', px: 2, py: .5, fontWeight: 900 }}>ABERTO</Box>}>Movimentações do turno</SectionHeader><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ p: 1.5, bgcolor: '#edf3f6', justifyContent: 'space-between' }}><Typography><b>Abertura:</b> {new Date(cash.openedAt).toLocaleString('pt-BR')}</Typography><Typography><b>Dinheiro em vendas:</b> {brl.format(cash.cashSales)}</Typography></Stack>{cash.movements.length === 0 ? <EmptyState icon="swap" title="Nenhuma movimentação" text="As movimentações aparecerão aqui." /> : <Stack>{cash.movements.map((item) => <Stack key={item.id} direction="row" sx={{ px: 2, py: 1.5, gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}><OperationIcon name={item.type === 'WITHDRAWAL' ? 'minus' : 'plus'} /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{movementLabel(item.type)}</Typography><Typography variant="caption">{item.reason} · {new Date(item.createdAt).toLocaleString('pt-BR')}</Typography></Box><Typography sx={{ fontWeight: 900, color: item.type === 'WITHDRAWAL' ? 'error.main' : 'success.main' }}>{item.type === 'WITHDRAWAL' ? '- ' : '+ '}{brl.format(item.amount)}</Typography></Stack>)}</Stack>}</Box></Grid>
      <Grid size={{ xs: 12, md: 4 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}><SectionHeader>Ações do caixa</SectionHeader><Stack sx={{ p: 1.5, gap: 1.5 }}><Button size="large" color="success" variant="contained" onClick={() => setDialog('supply')} startIcon={<OperationIcon name="plus" />}>Registrar suprimento</Button><Button size="large" color="warning" variant="contained" onClick={() => setDialog('withdraw')} startIcon={<OperationIcon name="minus" />}>Registrar sangria</Button><Button size="large" color="error" variant="contained" onClick={() => setDialog('close')} startIcon={<OperationIcon name="lock" />}>Fechar caixa</Button><Box sx={{ bgcolor: '#eaf3f7', border: '1px solid #9db5c3', p: 1.5 }}><Typography variant="body2">Suprimentos: <b>{brl.format(cash.supplies)}</b></Typography><Typography variant="body2">Sangrias: <b>{brl.format(cash.withdrawals)}</b></Typography></Box></Stack></Box></Grid></Grid>
    </>}
    <CashDialog key={dialog} type={dialog} expected={cash?.expectedAmount ?? 0} onClose={() => setDialog(null)} onConfirm={submit} />
  </>;
}

function movementLabel(type: string) {
  return ({ OPENING: 'Abertura', SUPPLY: 'Suprimento', WITHDRAWAL: 'Sangria', CASH_SALE: 'Venda em dinheiro' } as Record<string, string>)[type] ?? type;
}

function CashDialog({ type, expected, onClose, onConfirm }: { type: DialogType; expected: number; onClose: () => void; onConfirm: (value: number, reason: string) => Promise<void> }) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  if (!type) return null;
  const labels = { open: ['Abrir caixa', 'Saldo inicial', 'Abrir turno'], supply: ['Registrar suprimento', 'Valor', 'Registrar'], withdraw: ['Registrar sangria', 'Valor', 'Registrar'], close: ['Fechar caixa', 'Valor contado', 'Conferir e fechar'] } as const;
  const amount = Number(value.replace(',', '.'));
  const needsReason = type === 'supply' || type === 'withdraw' || type === 'close' && Number.isFinite(amount) && amount !== expected;
  async function confirm() { setSaving(true); try { await onConfirm(amount, reason); } finally { setSaving(false); } }
  return <Dialog open onClose={onClose} fullWidth maxWidth="xs"><DialogTitle sx={{ bgcolor: type === 'close' ? moduleColors.cash : moduleColors.header, color: '#fff', fontWeight: 900 }}>{labels[type][0]}</DialogTitle><DialogContent><Stack sx={{ gap: 2, pt: 2 }}><TextField autoFocus label={labels[type][1]} value={value} onChange={(event) => setValue(event.target.value)} inputMode="decimal" helperText={type === 'close' ? `Saldo esperado: ${brl.format(expected)}` : undefined} />{type !== 'open' && <TextField label={type === 'close' ? 'Justificativa da diferença' : 'Motivo'} value={reason} onChange={(event) => setReason(event.target.value)} multiline rows={3} required={needsReason} />}</Stack></DialogContent><DialogActions><Button onClick={onClose}>Cancelar</Button><Button variant="contained" disabled={saving || !Number.isFinite(amount) || amount < 0 || needsReason && !reason.trim()} onClick={() => void confirm()}>{saving ? 'Processando…' : labels[type][2]}</Button></DialogActions></Dialog>;
}
