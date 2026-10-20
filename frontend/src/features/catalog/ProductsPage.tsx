import { useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { brl, demoProducts, type DemoProduct } from '@/shared/demo/demoData';

export function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState(demoProducts);
  const categories = ['Todas', ...new Set(products.map((item) => item.category))];
  const filtered = useMemo(() => products.filter((item) => (category === 'Todas' || item.category === category) && `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase())), [category, products, query]);

  function addDemoProduct() {
    setProducts((current) => [...current, { id: Date.now(), name: 'Novo produto', category: 'Sorvetes', sku: `NOV-${current.length + 1}`, price: 10, stock: 0, minimum: 5, color: '#b59be8', active: true }]);
    setOpen(false);
  }

  return <>
    <PageHeader eyebrow="Catálogo" title="Produtos" description="Gerencie os itens disponíveis no frente de caixa." action={<Button variant="contained" onClick={() => setOpen(true)}>+ Novo produto</Button>} />
    <Card>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2.5, alignItems: { md: 'center' } }}>
        <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou código" size="small" sx={{ flex: 1 }} slotProps={{ input: { startAdornment: <InputAdornment position="start">⌕</InputAdornment> } }} />
        <TextField select value={category} onChange={(event) => setCategory(event.target.value)} size="small" sx={{ minWidth: 180 }}>{categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <Chip label="Dados de demonstração" color="secondary" variant="outlined" />
      </Stack>
      <TableContainer>
        <Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Categoria</TableCell><TableCell>Preço</TableCell><TableCell>Estoque</TableCell><TableCell>Status</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
          <TableBody>{filtered.map((item) => <TableRow key={item.id} hover><TableCell><Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: item.color, boxShadow: `inset 0 0 0 12px ${item.color}55` }} /><Box><Typography variant="body2" sx={{ fontWeight: 750 }}>{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.sku}</Typography></Box></Stack></TableCell><TableCell>{item.category}</TableCell><TableCell sx={{ fontWeight: 700 }}>{brl.format(item.price)}</TableCell><TableCell><Chip size="small" label={`${item.stock} un.`} color={item.stock <= item.minimum ? 'warning' : 'default'} /></TableCell><TableCell><Chip size="small" label={item.active ? 'Ativo' : 'Inativo'} color={item.active ? 'success' : 'default'} variant="outlined" /></TableCell><TableCell align="right"><Button size="small">Editar</Button><Switch size="small" checked={item.active} onChange={() => setProducts((all) => all.map((product) => product.id === item.id ? { ...product, active: !product.active } : product))} inputProps={{ 'aria-label': `Alterar status de ${item.name}` }} /></TableCell></TableRow>)}</TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 2.5 }}>{filtered.length} de {products.length} produtos</Typography>
    </Card>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Novo produto</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField label="Nome do produto" autoFocus /><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label="Código / SKU" fullWidth /><TextField select label="Categoria" defaultValue="Sorvetes" fullWidth>{categories.slice(1).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label="Preço de venda" defaultValue="10,00" fullWidth /><TextField label="Estoque mínimo" type="number" defaultValue="5" fullWidth /></Stack><Typography variant="caption" color="warning.dark">Modo demonstração: este cadastro não será persistido após recarregar.</Typography></Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={addDemoProduct}>Adicionar à prévia</Button></DialogActions></Dialog>
  </>;
}
