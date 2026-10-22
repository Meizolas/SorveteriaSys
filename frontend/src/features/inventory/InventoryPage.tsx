import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment, MenuItem, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import * as api from '@/shared/api/operationsApi';
import type { ProductView, StockMovementView } from '@/shared/api/operationsApi';
import { CategoryTag, EmptyState, MetricTile, SectionHeader } from '@/shared/ui/OperationalUi';
import { OperationIcon } from '@/shared/ui/OperationIcon';

type MovementType = 'ENTRY' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export function InventoryPage() {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [movements, setMovements] = useState<StockMovementView[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ productId: 0, type: 'ENTRY' as MovementType, quantity: '1', reason: '' });

  async function load() {
    setError('');
    try {
      const [items, history] = await Promise.all([api.listProducts(), api.listStockMovements()]);
      setProducts(items);
      setMovements(history);
      setForm((current) => ({ ...current, productId: current.productId || items[0]?.id || 0 }));
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível carregar o estoque.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const low = products.filter((product) => product.tracksStock && isLow(product)).length;
  const rows = useMemo(() => products.filter((product) =>
    product.tracksStock
    && `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'Todos' || (filter === 'Baixo' ? isLow(product) : !isLow(product)))),
  [products, query, filter]);
  const movementsToday = movements.filter((movement) => localDate(movement.createdAt) === localDate(new Date().toISOString())).length;

  async function move() {
    setSaving(true);
    setError('');
    try {
      await api.createStockMovement({
        productId: form.productId,
        type: form.type,
        quantity: Number(form.quantity.replace(',', '.')),
        reason: form.reason.trim()
      });
      setOpen(false);
      setMessage('Movimentação registrada e saldo atualizado.');
      setForm((current) => ({ ...current, quantity: '1', reason: '' }));
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Movimento inválido. Confira o saldo.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Stack sx={{ alignItems: 'center', py: 10 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Carregando estoque…</Typography></Stack>;

  return <>
    <PageHeader title="Estoque" description="Saldos e rastreabilidade de movimentos"
      action={<Button size="large" variant="contained" color="warning" onClick={() => setOpen(true)} startIcon={<OperationIcon name="plus" />}>Nova movimentação</Button>} />
    {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
    <Grid container spacing={1} sx={{ mb: 1.5 }}>
      <Grid size={{ xs: 4 }}><MetricTile label="Itens controlados" value={`${products.filter((product) => product.tracksStock).length}`} icon="stock" color={moduleColors.products} /></Grid>
      <Grid size={{ xs: 4 }}><MetricTile label="Estoque baixo" value={`${low}`} icon="warning" color={moduleColors.stock} /></Grid>
      <Grid size={{ xs: 4 }}><MetricTile label="Movimentos hoje" value={`${movementsToday}`} icon="swap" color="#477ba0" /></Grid>
    </Grid>

    <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', mb: 2 }}>
      <SectionHeader color={moduleColors.products}>Posição atual</SectionHeader>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, p: 1.5 }}>
        <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou código" sx={{ flex: 1 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><OperationIcon name="search" /></InputAdornment> } }} />
        <TextField select label="Situação" value={filter} onChange={(event) => setFilter(event.target.value)} sx={{ minWidth: 190 }}>
          <MenuItem value="Todos">Todas</MenuItem><MenuItem value="Baixo">Estoque baixo</MenuItem><MenuItem value="Regular">Regular</MenuItem>
        </TextField>
      </Stack>
      <Typography sx={{ fontWeight: 700, px: 1.5, pb: 1 }}>{rows.length} produtos · {low} abaixo do mínimo</Typography>
      <StockPosition products={rows} />
    </Box>

    <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
      <SectionHeader color="#477ba0" action={<Typography sx={{ fontWeight: 900 }}>{movements.length} RECENTES</Typography>}>Histórico de movimentações</SectionHeader>
      <MovementHistory movements={movements} />
    </Box>

    <MovementDialog open={open} products={products} form={form} saving={saving}
      onChange={setForm} onClose={() => setOpen(false)} onConfirm={move} />
    <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')}>
      <Alert severity="success">{message}</Alert>
    </Snackbar>
  </>;
}

function StockPosition({ products }: { products: ProductView[] }) {
  if (products.length === 0) return <EmptyState icon="stock" title="Nenhum produto encontrado" text="Altere os filtros ou cadastre um produto controlado em estoque." />;
  return <>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}><Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Categoria</TableCell><TableCell>Saldo atual</TableCell><TableCell>Mínimo</TableCell><TableCell>Situação</TableCell></TableRow></TableHead><TableBody>{products.map((product) => <TableRow key={product.id} sx={{ bgcolor: isLow(product) ? '#fff0bd' : '#fff' }}><TableCell><Typography sx={{ fontWeight: 900 }}>{product.name}</Typography><Typography variant="caption">{product.sku}</Typography></TableCell><TableCell><CategoryTag color={isLow(product) ? moduleColors.products : moduleColors.pos}>{product.category}</CategoryTag></TableCell><TableCell sx={{ fontWeight: 900, fontSize: 18 }}>{quantity(product.stock)} un.</TableCell><TableCell sx={{ fontWeight: 800 }}>{quantity(product.minimumStock)} un.</TableCell><TableCell><Status low={isLow(product)} /></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    <Stack sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, p: 1 }}>{products.map((product) => <Box key={product.id} sx={{ bgcolor: isLow(product) ? '#fff0bd' : '#fff', border: '1px solid', borderColor: isLow(product) ? 'warning.main' : 'divider', p: 1.5 }}><Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}><OperationIcon name="product" size={40} /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{product.name}</Typography><Typography variant="caption">{product.sku}</Typography></Box><Box><Typography variant="caption">Saldo</Typography><Typography sx={{ fontWeight: 900, fontSize: 20 }}>{quantity(product.stock)} un.</Typography></Box></Stack><Stack direction="row" sx={{ mt: 1, justifyContent: 'space-between' }}><CategoryTag>{product.category}</CategoryTag><Status low={isLow(product)} /></Stack></Box>)}</Stack>
  </>;
}

function MovementHistory({ movements }: { movements: StockMovementView[] }) {
  if (movements.length === 0) return <EmptyState icon="swap" title="Nenhuma movimentação registrada" text="Entradas, ajustes, vendas e estornos aparecerão aqui." />;
  return <>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}><Table><TableHead><TableRow><TableCell>Data e hora</TableCell><TableCell>Produto</TableCell><TableCell>Tipo</TableCell><TableCell>Quantidade</TableCell><TableCell>Saldo</TableCell><TableCell>Motivo / operador</TableCell></TableRow></TableHead><TableBody>{movements.map((movement) => <TableRow key={movement.id} hover><TableCell>{formatDateTime(movement.createdAt)}</TableCell><TableCell><Typography sx={{ fontWeight: 900 }}>{movement.productName}</Typography><Typography variant="caption">{movement.sku}</Typography></TableCell><TableCell><CategoryTag color={movementColor(movement.type)}>{movementLabel(movement.type)}</CategoryTag></TableCell><TableCell sx={{ fontWeight: 900, color: isOutgoing(movement.type) ? 'error.main' : 'success.main' }}>{isOutgoing(movement.type) ? '- ' : '+ '}{quantity(movement.quantity)}</TableCell><TableCell>{quantity(movement.previousQuantity)} → <b>{quantity(movement.resultingQuantity)}</b></TableCell><TableCell>{movement.reason}<Typography variant="caption" sx={{ display: 'block' }}>por {movement.actor}</Typography></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    <Stack sx={{ display: { xs: 'flex', md: 'none' } }}>{movements.map((movement) => <Box key={movement.id} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}><Box><Typography sx={{ fontWeight: 900 }}>{movement.productName}</Typography><Typography variant="caption">{formatDateTime(movement.createdAt)} · {movement.actor}</Typography></Box><Typography sx={{ fontWeight: 900, fontSize: 18, color: isOutgoing(movement.type) ? 'error.main' : 'success.main' }}>{isOutgoing(movement.type) ? '- ' : '+ '}{quantity(movement.quantity)}</Typography></Stack><Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1, alignItems: 'center' }}><CategoryTag color={movementColor(movement.type)}>{movementLabel(movement.type)}</CategoryTag><Typography>{quantity(movement.previousQuantity)} → <b>{quantity(movement.resultingQuantity)}</b></Typography></Stack><Typography variant="body2" sx={{ mt: 1 }}>{movement.reason}</Typography></Box>)}</Stack>
  </>;
}

function MovementDialog({ open, products, form, saving, onChange, onClose, onConfirm }: { open: boolean; products: ProductView[]; form: { productId: number; type: MovementType; quantity: string; reason: string }; saving: boolean; onChange: (value: typeof form) => void; onClose: () => void; onConfirm: () => Promise<void> }) {
  const amount = Number(form.quantity.replace(',', '.'));
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle sx={{ bgcolor: moduleColors.stock, color: '#fff', fontWeight: 900 }}>Nova movimentação</DialogTitle><DialogContent><Stack sx={{ gap: 2, pt: 2 }}><TextField select label="Produto" value={form.productId} onChange={(event) => onChange({ ...form, productId: Number(event.target.value) })}>{products.filter((product) => product.tracksStock).map((product) => <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>)}</TextField><TextField select label="Tipo" value={form.type} onChange={(event) => onChange({ ...form, type: event.target.value as MovementType })}><MenuItem value="ENTRY">Entrada</MenuItem><MenuItem value="ADJUSTMENT_IN">Ajuste de entrada</MenuItem><MenuItem value="ADJUSTMENT_OUT">Ajuste de saída</MenuItem></TextField><TextField label="Quantidade" value={form.quantity} onChange={(event) => onChange({ ...form, quantity: event.target.value })} inputMode="decimal" /><TextField required label="Motivo" multiline rows={3} value={form.reason} onChange={(event) => onChange({ ...form, reason: event.target.value })} slotProps={{ htmlInput: { maxLength: 240 } }} /></Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={saving}>Cancelar</Button><Button variant="contained" color="warning" onClick={() => void onConfirm()} disabled={saving || !form.productId || !Number.isFinite(amount) || amount <= 0 || !form.reason.trim()}>{saving ? 'Registrando…' : 'Registrar'}</Button></DialogActions></Dialog>;
}

function Status({ low }: { low: boolean }) { return <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, bgcolor: low ? moduleColors.stock : 'success.main', color: '#fff', p: 1, fontWeight: 900 }}>{low && <OperationIcon name="warning" size={20} />}{low ? 'REPOR ESTOQUE' : 'REGULAR'}</Box>; }
function isLow(product: ProductView) { return Number(product.stock) <= Number(product.minimumStock); }
function isOutgoing(type: string) { return type === 'ADJUSTMENT_OUT' || type === 'SALE_OUT'; }
function quantity(value: number) { return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(Number(value)); }
function movementLabel(type: string) { return ({ ENTRY: 'Entrada', ADJUSTMENT_IN: 'Ajuste de entrada', ADJUSTMENT_OUT: 'Ajuste de saída', SALE_OUT: 'Venda', SALE_RETURN: 'Estorno de venda' } as Record<string, string>)[type] ?? type; }
function movementColor(type: string) { return isOutgoing(type) ? moduleColors.stock : type === 'SALE_RETURN' ? '#477ba0' : moduleColors.products; }
function localDate(value: string) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bahia' }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' }).format(new Date(value)); }
