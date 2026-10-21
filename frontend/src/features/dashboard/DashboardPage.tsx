import { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { ActionTile, EmptyState, MetricTile, SectionHeader } from '@/shared/ui/OperationalUi';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import { listProducts } from '@/shared/api/operationsApi';

export function DashboardPage() {
  const [lowStock, setLowStock] = useState<number | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { void listProducts().then((items) => setLowStock(items.filter((item) => item.tracksStock && item.stock <= item.minimumStock).length)).catch(() => setFailed(true)); }, []);
  return <><PageHeader title="Visão geral" description="Resumo da operação de hoje" status={<Box sx={{ bgcolor: '#dbe4ea', px: 2, py: 1, fontWeight: 900, textTransform: 'uppercase' }}>Demonstração</Box>} />
    {failed && <Alert severity="error" sx={{ mb: 2 }}>Não foi possível consultar o estoque.</Alert>}
    <Grid container spacing={1}><Grid size={{ xs: 6, lg: 3 }}><MetricTile label="Faturamento hoje" value="R$ 0,00" icon="chart" color={moduleColors.pos} /></Grid><Grid size={{ xs: 6, lg: 3 }}><MetricTile label="Vendas realizadas" value="0" icon="cart" color={moduleColors.products} /></Grid><Grid size={{ xs: 6, lg: 3 }}><MetricTile label="Ticket médio" value="R$ 0,00" icon="product" color="#50697a" /></Grid><Grid size={{ xs: 6, lg: 3 }}><MetricTile label="Estoque baixo" value={lowStock === null ? '—' : `${lowStock} itens`} icon="warning" color={moduleColors.stock} /></Grid></Grid>
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Operações</Typography>
    <Grid container spacing={1}><Grid size={{ xs: 12, md: 4 }}><ActionTile to="/pdv" label="Frente de caixa" caption="Registrar venda" icon="pos" color={moduleColors.pos} /></Grid><Grid size={{ xs: 12, md: 4 }}><ActionTile to="/produtos" label="Produtos" caption="Consultar e cadastrar" icon="product" color={moduleColors.products} /></Grid><Grid size={{ xs: 12, md: 4 }}><ActionTile to="/estoque" label="Estoque" caption="Consultar saldos" icon="stock" color={moduleColors.stock} /></Grid></Grid>
    <Grid container spacing={1.5} sx={{ mt: .5 }}><Grid size={{ xs: 12, md: 8 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader color="#50616e">Movimento de hoje</SectionHeader><Box sx={{ px: 2, pt: 1 }}><Typography variant="body2">Vendas por horário</Typography><Box sx={{ minHeight: 205, mt: 1, borderLeft: '1px solid #aabac5', borderBottom: '1px solid #aabac5', backgroundImage: 'linear-gradient(#dce6eb 1px, transparent 1px)', backgroundSize: '100% 42px' }}><EmptyState icon="chart" title="Nenhuma venda registrada hoje" text="O movimento aparecerá após a integração real das vendas." /></Box></Box></Box></Grid><Grid size={{ xs: 12, md: 4 }}><Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', height: '100%' }}><SectionHeader color={moduleColors.cash}><Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><OperationIcon name="lock" /> Caixa fechado</Stack></SectionHeader><Stack sx={{ p: 2, minHeight: 250, justifyContent: 'center', textAlign: 'center' }}><Typography sx={{ mb: 2 }}>Abra o caixa para iniciar as vendas.</Typography><Button component={Link} to="/caixa" variant="contained" color="success" size="large" startIcon={<OperationIcon name="pos" />}>Abrir caixa</Button></Stack></Box></Grid></Grid>
    {lowStock !== null && lowStock > 0 && <Stack direction="row" sx={{ mt: 1.5, p: 1.5, bgcolor: '#fff1c7', border: '1px solid #e4a000', alignItems: 'center', gap: 1.5 }}><OperationIcon name="warning" size={32} /><Typography sx={{ fontWeight: 900, color: '#a84d00' }}>{lowStock} produtos abaixo do estoque mínimo</Typography><Box sx={{ flex: 1 }} /><Button component={Link} to="/estoque" variant="contained" color="warning">Ver estoque</Button></Stack>}
  </>;
}
