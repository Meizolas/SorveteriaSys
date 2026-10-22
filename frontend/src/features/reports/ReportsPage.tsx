import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { getSalesReport, type SalesReportView } from '@/shared/api/operationsApi';
import { CategoryTag, EmptyState, MetricTile, SectionHeader } from '@/shared/ui/OperationalUi';
import { OperationIcon } from '@/shared/ui/OperationIcon';

export function ReportsPage() {
  const defaults = useMemo(() => monthPeriod(), []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [report, setReport] = useState<SalesReportView>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setReport(await getSalesReport(from, to)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Não foi possível gerar o relatório.'); }
    finally { setLoading(false); }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  const maxDaily = Math.max(...(report?.dailySales.map((day) => Number(day.total)) ?? [0]), 1);
  return <>
    <PageHeader title="Relatórios" description="Desempenho comercial por período" status={<Box sx={{ bgcolor: '#5b657d', color: '#fff', px: 2, py: 1, fontWeight: 900 }}>GERENCIAL</Box>} />
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 1.5, gap: 1, mb: 1.5, alignItems: { sm: 'center' } }}>
      <TextField label="Data inicial" type="date" value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="Data final" type="date" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <Button size="large" variant="contained" onClick={() => void load()} disabled={loading || !from || !to || from > to} startIcon={<OperationIcon name="search" />}>Gerar relatório</Button>
    </Stack>
    {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
    {loading ? <Stack sx={{ alignItems: 'center', py: 10 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Consolidando vendas…</Typography></Stack> : report && <>
      <Grid container spacing={1} sx={{ mb: 1.5 }}><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Faturamento líquido" value={brl.format(report.revenue)} icon="cash" color={moduleColors.products} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Vendas concluídas" value={`${report.completedSales}`} icon="receipt" color={moduleColors.pos} /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Ticket médio" value={brl.format(report.averageTicket)} icon="chart" color="#477ba0" /></Grid><Grid size={{ xs: 6, md: 3 }}><MetricTile label="Cancelamentos" value={`${report.canceledSales}`} icon="close" color={moduleColors.cash} /></Grid></Grid>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 7 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader color="#477ba0">Faturamento por dia</SectionHeader>{report.dailySales.every((day) => Number(day.total) === 0) ? <EmptyState icon="chart" title="Sem vendas no período" text="Escolha outro intervalo ou registre vendas no PDV." /> : <Stack sx={{ p: 2, gap: 1.2 }}>{report.dailySales.map((day) => <Stack key={day.date} direction="row" sx={{ alignItems: 'center', gap: 1 }}><Typography variant="caption" sx={{ width: 72 }}>{formatDay(day.date)}</Typography><Box sx={{ flex: 1, height: 26, bgcolor: '#e6edf1' }}><Box sx={{ width: `${Math.max(Number(day.total) / maxDaily * 100, Number(day.total) > 0 ? 3 : 0)}%`, height: '100%', bgcolor: moduleColors.pos }} /></Box><Typography sx={{ width: 105, textAlign: 'right', fontWeight: 900 }}>{brl.format(day.total)}</Typography></Stack>)}</Stack>}</Box></Grid>
        <Grid size={{ xs: 12, lg: 5 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader color={moduleColors.cash}>Formas de pagamento</SectionHeader>{report.payments.length === 0 ? <EmptyState icon="cash" title="Sem recebimentos" text="Não existem vendas concluídas no período." /> : <Stack>{report.payments.map((payment) => <Stack key={payment.method} direction="row" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center', gap: 1 }}><OperationIcon name="wallet" /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{paymentLabel(payment.method)}</Typography><Typography variant="caption">{payment.salesCount} vendas</Typography></Box><Typography sx={{ fontWeight: 900, fontSize: 18 }}>{brl.format(payment.total)}</Typography></Stack>)}</Stack>}</Box></Grid>
        <Grid size={{ xs: 12 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}><SectionHeader color={moduleColors.products}>Produtos mais vendidos</SectionHeader>{report.topProducts.length === 0 ? <EmptyState icon="product" title="Nenhum produto vendido" text="O ranking aparecerá quando houver vendas concluídas." /> : <Stack>{report.topProducts.map((product, index) => <Stack key={product.productId} direction="row" sx={{ p: 1.5, alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', bgcolor: index < 3 ? moduleColors.products : '#dce6ec', color: index < 3 ? '#fff' : 'text.primary', fontWeight: 900 }}>{index + 1}</Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{product.name}</Typography><Typography variant="caption">{product.sku}</Typography></Box><CategoryTag>{formatQuantity(product.quantity)} vendidos</CategoryTag><Typography sx={{ minWidth: 110, textAlign: 'right', fontWeight: 900 }}>{brl.format(product.revenue)}</Typography></Stack>)}</Stack>}</Box></Grid>
      </Grid>
    </>}
  </>;
}

function monthPeriod() { const now = new Date(); const to = localDate(now); return { from: `${to.slice(0, 8)}01`, to }; }
function localDate(value: Date) { const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value); const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''; return `${part('year')}-${part('month')}-${part('day')}`; }
function formatDay(value: string) { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }
function formatQuantity(value: number) { return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(Number(value)); }
function paymentLabel(method: string) { return ({ CASH: 'Dinheiro', PIX: 'Pix', CARD: 'Cartão' } as Record<string, string>)[method] ?? method; }
