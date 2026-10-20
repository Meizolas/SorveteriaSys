import { Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { PageHeader } from '@/app/AppShell';

const metrics = [
  ['Faturamento hoje', 'R$ 0,00', 'Nenhuma venda registrada', '#6d3bd1', 'R$'],
  ['Vendas realizadas', '0', 'Comece pelo frente de caixa', '#ef6c54', '↗'],
  ['Ticket médio', 'R$ 0,00', 'Calculado sobre as vendas', '#16886f', '◎'],
  ['Itens com estoque baixo', '0', 'Todos os itens estão regulares', '#d98b18', '!']
] as const;

export function DashboardPage() {
  return <>
    <PageHeader eyebrow="Painel operacional" title="Bom dia!" description="Acompanhe a operação da sorveteria em um só lugar." action={<Button component={Link} to="/pdv" variant="contained" size="large">+ Nova venda</Button>} />
    <Grid container spacing={2.5}>
      {metrics.map(([label, value, hint, tone, icon]) => <Grid key={label} size={{ xs: 12, sm: 6, xl: 3 }}><Card><CardContent sx={{ p: 2.5 }}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Box><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="h4" sx={{ mt: 1 }}>{value}</Typography></Box><Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: `${tone}16`, color: tone, fontWeight: 800 }}>{icon}</Box></Stack><Typography variant="caption" color="text.secondary">{hint}</Typography></CardContent></Card></Grid>)}
      <Grid size={{ xs: 12, lg: 8 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}><Box><Typography variant="h6">Movimento de hoje</Typography><Typography variant="body2" color="text.secondary">Vendas por período</Typography></Box><Chip label="Hoje" size="small" /></Stack><Box sx={{ height: 230, mt: 3, display: 'flex', alignItems: 'end', gap: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>{[18, 30, 22, 46, 35, 58, 42, 66, 51, 72, 62].map((h, i) => <Box key={i} sx={{ flex: 1, height: `${h}%`, minWidth: 8, bgcolor: i === 10 ? 'primary.main' : 'primary.50', borderRadius: '7px 7px 0 0' }} />)}</Box><Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1 }}><Typography variant="caption" color="text.secondary">09h</Typography><Typography variant="caption" color="text.secondary">14h</Typography><Typography variant="caption" color="text.secondary">20h</Typography></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 4 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Typography variant="h6">Status do caixa</Typography><Stack sx={{ alignItems: 'center', py: 3 }}><Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: 'warning.50', color: 'warning.dark', display: 'grid', placeItems: 'center', fontSize: 28 }}>◫</Box><Typography variant="h6" sx={{ mt: 2 }}>Caixa fechado</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Abra um turno para começar a registrar vendas.</Typography></Stack><Button component={Link} to="/caixa" fullWidth variant="outlined">Abrir caixa</Button></CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 7 }}><Card><CardContent sx={{ p: 3 }}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Box><Typography variant="h6">Vendas recentes</Typography><Typography variant="body2" color="text.secondary">Últimas movimentações do balcão</Typography></Box><Button component={Link} to="/pdv" size="small">Ver PDV</Button></Stack><Divider sx={{ my: 2.5 }} /><Stack sx={{ alignItems: 'center', py: 4 }}><Typography sx={{ fontSize: 32 }}>⌁</Typography><Typography sx={{ fontWeight: 700, mt: 1 }}>Nenhuma venda hoje</Typography><Typography variant="body2" color="text.secondary">As vendas concluídas aparecerão aqui.</Typography></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 5 }}><Card><CardContent sx={{ p: 3 }}><Typography variant="h6">Preparação do catálogo</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Progresso para iniciar a operação</Typography><Stack spacing={2}><Progress label="Produtos cadastrados" /><Progress label="Produtos com estoque" secondary /><Button component={Link} to="/produtos" variant="text" sx={{ alignSelf: 'start', px: 0 }}>Configurar produtos →</Button></Stack></CardContent></Card></Grid>
    </Grid>
  </>;
}

function Progress({ label, secondary = false }: { label: string; secondary?: boolean }) {
  return <Box><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="body2">{label}</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>0</Typography></Stack><LinearProgress variant="determinate" value={0} color={secondary ? 'secondary' : 'primary'} sx={{ mt: 1 }} /></Box>;
}
