import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, InputAdornment, MenuItem, Snackbar, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { brl } from '@/shared/demo/demoData';
import * as api from '@/shared/api/operationsApi';
import type { CategoryView, ProductView } from '@/shared/api/operationsApi';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import { CategoryTag } from '@/shared/ui/OperationalUi';

const categoryColors = ['#0877e8', '#008f83', '#477ba0', '#cf8b00', '#71377e'];
type ProductForm = {
  name: string; sku: string; categoryId: number; price: string;
  minimumStock: string; tracksStock: boolean; active: boolean;
};
const emptyForm = (): ProductForm => ({
  name: '', sku: '', categoryId: 0, price: '10,00', minimumStock: '5',
  tracksStock: true, active: true
});

export function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductView | null>(null);
  const [products, setProducts] = useState<ProductView[]>([]);
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  async function load() {
    try {
      const [items, groups] = await Promise.all([api.listProducts(), api.listCategories()]);
      setProducts(items);
      setCategories(groups);
      setForm((old) => ({ ...old, categoryId: old.categoryId || groups[0]?.id || 0 }));
    } catch {
      setError('Não foi possível carregar os produtos.');
    }
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => products.filter((product) =>
    (category === 'Todas' || product.category === category)
    && (status === 'Todos' || (status === 'Ativos' ? product.active : !product.active))
    && `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())),
  [products, category, status, query]);
  const colorFor = (name: string) => categoryColors[
    Math.max(0, categories.findIndex((item) => item.name === name)) % categoryColors.length
  ] ?? '#0877e8';

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm(), categoryId: categories[0]?.id ?? 0 });
    setDialogOpen(true);
  }

  function openEdit(product: ProductView) {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price.toFixed(2).replace('.', ','),
      minimumStock: String(product.minimumStock).replace('.', ','),
      tracksStock: product.tracksStock,
      active: product.active
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    if (!saving) setDialogOpen(false);
  }

  async function save() {
    const price = Number(form.price.replace(',', '.'));
    const minimumStock = Number(form.minimumStock.replace(',', '.'));
    if (!form.name.trim() || !form.categoryId || !Number.isFinite(price) || price < 0
      || !Number.isFinite(minimumStock) || minimumStock < 0) {
      setError('Preencha nome, categoria, preço e estoque mínimo corretamente.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.updateProduct(editing.id, {
          categoryId: form.categoryId, name: form.name.trim(), price, active: form.active,
          tracksStock: form.tracksStock, minimumStock
        });
        setNotice('Produto atualizado com sucesso.');
      } else {
        await api.createProduct({
          categoryId: form.categoryId, name: form.name.trim(), sku: form.sku.trim(), price,
          tracksStock: form.tracksStock, minimumStock
        });
        setNotice('Produto cadastrado com sucesso.');
      }
      setDialogOpen(false);
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(product: ProductView) {
    try {
      await api.updateProduct(product.id, {
        categoryId: product.categoryId, name: product.name, price: product.price,
        active: !product.active, tracksStock: product.tracksStock,
        minimumStock: product.minimumStock
      });
      setNotice(product.active ? 'Produto desativado.' : 'Produto ativado.');
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível alterar o produto.');
    }
  }

  const actions = (product: ProductView, mobile = false) => <Stack direction="row" sx={{ gap: 1 }}>
    <Button fullWidth={mobile} variant="contained" onClick={() => openEdit(product)}
      startIcon={<OperationIcon name="edit" />}>Editar</Button>
    <Button fullWidth={mobile} variant="outlined" color={product.active ? 'error' : 'success'}
      onClick={() => void toggle(product)}>{product.active ? 'Desativar' : 'Ativar'}</Button>
  </Stack>;

  return <>
    <PageHeader title="Produtos" status={<Box sx={{ bgcolor: '#dbe4ea', px: 2, py: 1, fontWeight: 900 }}>DADOS REAIS</Box>}
      action={<Button variant="contained" color="success" size="large" onClick={openCreate}
        startIcon={<OperationIcon name="plus" />}>Novo produto</Button>} />
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1, mb: 1.5 }}>
      <TextField value={query} onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome ou código" sx={{ flex: 1 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><OperationIcon name="search" /></InputAdornment> } }} />
      <TextField select label="Categoria" value={category} onChange={(event) => setCategory(event.target.value)} sx={{ minWidth: 190 }}>
        <MenuItem value="Todas">Todas</MenuItem>{categories.map((item) => <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>)}
      </TextField>
      <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 170 }}>
        {['Todos', 'Ativos', 'Inativos'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </TextField>
    </Stack>
    <Typography sx={{ fontWeight: 700, mb: 1 }}>{filtered.length} produtos cadastrados</Typography>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
      <Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Categoria</TableCell><TableCell>Preço</TableCell><TableCell>Estoque</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
        <TableBody>{filtered.map((product) => <TableRow key={product.id} hover>
          <TableCell><Typography sx={{ fontWeight: 900 }}>{product.name}</Typography><Typography variant="caption">{product.sku}</Typography></TableCell>
          <TableCell><CategoryTag color={colorFor(product.category)}>{product.category}</CategoryTag></TableCell>
          <TableCell sx={{ fontWeight: 900 }}>{brl.format(product.price)}</TableCell>
          <TableCell sx={{ fontWeight: 900, bgcolor: product.stock <= product.minimumStock ? '#fff0bd' : 'transparent' }}>{Number(product.stock)} un.</TableCell>
          <TableCell><Box sx={{ bgcolor: product.active ? 'success.main' : '#647687', color: '#fff', p: 1, textAlign: 'center', fontWeight: 900 }}>{product.active ? 'ATIVO' : 'INATIVO'}</Box></TableCell>
          <TableCell>{actions(product)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </TableContainer>
    <Stack sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>{filtered.map((product) => <Box key={product.id} sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 1.5 }}>
      <Stack direction="row" sx={{ gap: 1.5 }}><OperationIcon name="product" size={43} /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{product.name}</Typography><Typography variant="caption">{product.sku}</Typography><Typography sx={{ fontSize: 22, fontWeight: 900 }}>{brl.format(product.price)}</Typography></Box><Box><Typography sx={{ fontWeight: 900 }}>{Number(product.stock)} un.</Typography><Box sx={{ bgcolor: product.active ? 'success.main' : '#647687', color: '#fff', p: .6, mt: 1, fontWeight: 900 }}>{product.active ? 'ATIVO' : 'INATIVO'}</Box></Box></Stack>
      <CategoryTag color={colorFor(product.category)}>{product.category}</CategoryTag>{actions(product, true)}
    </Box>)}</Stack>
    <ProductDialog open={dialogOpen} editing={editing} form={form} categories={categories}
      saving={saving} onChange={setForm} onClose={closeDialog} onSave={() => void save()} />
    <Snackbar open={Boolean(notice || error)} autoHideDuration={3500} onClose={() => { setNotice(''); setError(''); }}>
      <Alert severity={error ? 'error' : 'success'}>{error || notice}</Alert>
    </Snackbar>
  </>;
}

function ProductDialog({ open, editing, form, categories, saving, onChange, onClose, onSave }: {
  open: boolean; editing: ProductView | null; form: ProductForm; categories: CategoryView[];
  saving: boolean; onChange: (form: ProductForm) => void; onClose: () => void; onSave: () => void;
}) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ bgcolor: '#123849', color: '#fff', fontWeight: 900 }}>{editing ? 'Editar produto' : 'Novo produto'}</DialogTitle>
    <DialogContent><Stack sx={{ gap: 2, pt: 2 }}>
      <TextField autoFocus label="Nome" value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required slotProps={{ htmlInput: { maxLength: 120 } }} />
      <TextField label="Código / SKU" value={form.sku} disabled={Boolean(editing)}
        helperText={editing ? 'O código não pode ser alterado depois do cadastro.' : 'Use um código único para o produto.'}
        onChange={(event) => onChange({ ...form, sku: event.target.value })} required={!editing} slotProps={{ htmlInput: { maxLength: 40 } }} />
      <TextField select label="Categoria" value={form.categoryId}
        onChange={(event) => onChange({ ...form, categoryId: Number(event.target.value) })} required>
        {categories.filter((item) => item.active).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
      </TextField>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
        <TextField fullWidth label="Preço" value={form.price} inputMode="decimal"
          onChange={(event) => onChange({ ...form, price: event.target.value })} required />
        <TextField fullWidth label="Estoque mínimo" value={form.minimumStock} inputMode="decimal"
          onChange={(event) => onChange({ ...form, minimumStock: event.target.value })}
          disabled={!form.tracksStock} required={form.tracksStock} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
        <FormControlLabel control={<Switch checked={form.tracksStock}
          onChange={(event) => onChange({ ...form, tracksStock: event.target.checked })} />}
          label="Controlar estoque" />
        {editing && <FormControlLabel control={<Switch checked={form.active}
          onChange={(event) => onChange({ ...form, active: event.target.checked })} />}
          label="Produto ativo" />}
      </Stack>
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Cancelar</Button>
      <Button variant="contained" onClick={onSave} disabled={saving || !form.name.trim() || !form.categoryId || (!editing && !form.sku.trim())}>
        {saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar'}
      </Button>
    </DialogActions>
  </Dialog>;
}
