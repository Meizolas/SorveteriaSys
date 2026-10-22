import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { cancelSale, getSale, listSales, type SaleDetailView, type SaleSummaryView } from '@/shared/api/operationsApi';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import { EmptyState } from '@/shared/ui/OperationalUi';
import { SaleCompletionDialog, type CompletedSale } from '@/features/pos/SaleCompletionDialog';

export function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleSummaryView[]>([]);
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('ALL');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<{ receipt: CompletedSale; operator: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SaleSummaryView | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try { setSales(await listSales()); }
    catch (value) { setError(value instanceof Error ? value.message : 'Não foi possível carregar as vendas.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => sales.filter((sale) => {
    const matchesQuery = `${sale.code} ${sale.operator}`.toLowerCase().includes(query.toLowerCase());
    const matchesPayment = payment === 'ALL' || sale.paymentMethod === payment;
    const matchesDate = !date || localDate(sale.completedAt) === date;
    return matchesQuery && matchesPayment && matchesDate;
  }), [date, payment, query, sales]);
  const total = filtered.reduce((sum, sale) => sum + (sale.status === 'COMPLETED' ? Number(sale.total) : 0), 0);

  async function openDetail(id: number) {
    setDetailLoading(true);
    setError('');
    try {
      const sale = await getSale(id);
      setSelected({ receipt: receiptFrom(sale), operator: sale.operator });
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível abrir a venda.');
    } finally { setDetailLoading(false); }
  }

  return <>
    <PageHeader title="Histórico de vendas" description="Consulte detalhes e reimprima comprovantes"
      status={<Box sx={{ bgcolor: '#50697a', color: '#fff', px: 2, py: 1, fontWeight: 900 }}>{sales.length} REGISTROS</Box>}
      action={<Button variant="outlined" onClick={() => void load()} disabled={loading}>Atualizar</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1, mb: 1.5 }}>
      <TextField value={query} onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por número ou operador" sx={{ flex: 1 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><OperationIcon name="search" /></InputAdornment> } }} />
      <TextField select label="Pagamento" value={payment} onChange={(event) => setPayment(event.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="ALL">Todos</MenuItem><MenuItem value="CASH">Dinheiro</MenuItem>
        <MenuItem value="PIX">Pix</MenuItem><MenuItem value="CARD">Cartão</MenuItem>
      </TextField>
      <TextField label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 180 }} />
    </Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ bgcolor: moduleColors.overview, color: '#fff', p: 1.5, mb: 1, gap: 2, justifyContent: 'space-between' }}>
      <Typography sx={{ fontWeight: 900 }}>{filtered.length} vendas encontradas</Typography>
      <Typography sx={{ fontWeight: 900 }}>Total exibido: {brl.format(total)}</Typography>
    </Stack>
    {loading ? <Stack sx={{ alignItems: 'center', py: 10 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Carregando vendas…</Typography></Stack>
      : filtered.length === 0 ? <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}><EmptyState icon="receipt" title="Nenhuma venda encontrada" text="Altere os filtros ou registre uma nova venda no PDV." /></Box>
        : <>
          <TableContainer sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
            <Table><TableHead><TableRow><TableCell>Venda</TableCell><TableCell>Status</TableCell><TableCell>Data e hora</TableCell><TableCell>Operador</TableCell><TableCell>Pagamento</TableCell><TableCell>Itens</TableCell><TableCell>Total</TableCell><TableCell>Ação</TableCell></TableRow></TableHead>
              <TableBody>{filtered.map((sale) => <TableRow key={sale.id} hover>
                <TableCell sx={{ fontWeight: 900 }}>{sale.code}</TableCell>
                <TableCell><Chip size="small" color={sale.status === 'COMPLETED' ? 'success' : 'error'} label={sale.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'} /></TableCell>
                <TableCell>{formatDateTime(sale.completedAt)}</TableCell><TableCell>{sale.operator}</TableCell>
                <TableCell>{paymentLabel(sale.paymentMethod)}</TableCell><TableCell>{sale.itemCount}</TableCell>
                <TableCell sx={{ fontWeight: 900, textDecoration: sale.status === 'CANCELED' ? 'line-through' : 'none' }}>{brl.format(sale.total)}</TableCell>
                <TableCell><Stack direction="row" sx={{ gap: 1 }}><Button variant="contained" disabled={detailLoading} onClick={() => void openDetail(sale.id)}
                  startIcon={<OperationIcon name="receipt" />}>Detalhes</Button>{sale.status === 'COMPLETED' && <Button color="error" variant="outlined" onClick={() => setCancelTarget(sale)} startIcon={<OperationIcon name="close" />}>Cancelar</Button>}</Stack></TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </TableContainer>
          <Stack sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>{filtered.map((sale) => <Box key={sale.id} sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 1.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}><Box><Typography sx={{ fontWeight: 900, fontSize: 18 }}>{sale.code}</Typography><Chip size="small" color={sale.status === 'COMPLETED' ? 'success' : 'error'} label={sale.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'} /><Typography variant="body2">{formatDateTime(sale.completedAt)}</Typography></Box><Typography sx={{ fontWeight: 900, fontSize: 22, textDecoration: sale.status === 'CANCELED' ? 'line-through' : 'none' }}>{brl.format(sale.total)}</Typography></Stack>
            <Typography sx={{ mt: 1 }}>{sale.operator} · {paymentLabel(sale.paymentMethod)} · {sale.itemCount} itens</Typography>
            <Button fullWidth variant="contained" sx={{ mt: 1 }} disabled={detailLoading} onClick={() => void openDetail(sale.id)} startIcon={<OperationIcon name="receipt" />}>Ver detalhes</Button>
            {sale.status === 'COMPLETED' && <Button fullWidth color="error" variant="outlined" sx={{ mt: 1 }} onClick={() => setCancelTarget(sale)}>Cancelar venda</Button>}
          </Box>)}</Stack>
        </>}
    <SaleCompletionDialog sale={selected?.receipt ?? null}
      {...(selected ? { operatorName: selected.operator } : {})}
      mode="history" onClose={() => setSelected(null)} />
    <CancellationDialog sale={cancelTarget} onClose={() => setCancelTarget(null)} onDone={async () => { setCancelTarget(null); await load(); }} />
  </>;
}

function CancellationDialog({ sale, onClose, onDone }: { sale: SaleSummaryView | null; onClose: () => void; onDone: () => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!sale) return null;
  async function confirm() {
    if (!sale) return;
    setSaving(true); setError('');
    try { await cancelSale(sale.id, reason.trim()); await onDone(); }
    catch (value) { setError(value instanceof Error ? value.message : 'Não foi possível cancelar a venda.'); }
    finally { setSaving(false); }
  }
  return <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ bgcolor: 'error.main', color: '#fff', fontWeight: 900 }}>Cancelar venda {sale.code}</DialogTitle>
    <DialogContent><Stack sx={{ pt: 2, gap: 2 }}><Alert severity="warning">O estoque será devolvido e pagamentos em dinheiro serão estornados no caixa original aberto.</Alert>{error && <Alert severity="error">{error}</Alert>}<TextField autoFocus required multiline rows={3} label="Motivo do cancelamento" value={reason} onChange={(event) => setReason(event.target.value)} slotProps={{ htmlInput: { maxLength: 240 } }} helperText={`${reason.length}/240`} /></Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Voltar</Button><Button color="error" variant="contained" disabled={saving || !reason.trim()} onClick={() => void confirm()}>{saving ? 'Cancelando…' : 'Confirmar cancelamento'}</Button></DialogActions>
  </Dialog>;
}

function receiptFrom(sale: SaleDetailView): CompletedSale {
  return {
    orderNumber: sale.code,
    completedAt: new Date(sale.completedAt),
    lines: sale.items.map((item) => ({
      product: { id: item.productId, name: item.name, price: Number(item.unitPrice) },
      quantity: Number(item.quantity)
    })),
    total: Number(sale.total),
    payment: paymentLabel(sale.paymentMethod),
    received: Number(sale.receivedAmount),
    change: Number(sale.changeAmount)
  };
}

function paymentLabel(method: string) {
  return ({ CASH: 'Dinheiro', PIX: 'Pix', CARD: 'Cartão' } as Record<string, string>)[method] ?? method;
}

function localDate(value: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' }).format(new Date(value));
}
