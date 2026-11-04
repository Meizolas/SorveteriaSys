import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { createSale, listProducts, type ProductView } from '@/shared/api/operationsApi';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import { SectionHeader } from '@/shared/ui/OperationalUi';
import { SaleCompletionDialog, type CompletedSale } from './SaleCompletionDialog';
import { PaymentTerminalDialog } from './PaymentTerminalDialog';
import { calculateChange, canCompleteSale } from './salePresentation';

type CartLine = { product: ProductView; quantity: number };

export function PosPage() {
  const mobile = useMediaQuery(useTheme().breakpoints.down('md'));
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('Todos'); const [cart, setCart] = useState<CartLine[]>([]); const [payment, setPayment] = useState('Dinheiro');
  const [orderOpen, setOrderOpen] = useState(false); const [paymentOpen, setPaymentOpen] = useState(false); const [receivedText, setReceivedText] = useState(''); const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [products, setProducts] = useState<ProductView[]>([]); const [loadError, setLoadError] = useState(''); const [submitting, setSubmitting] = useState(false);
  const [scaleProduct, setScaleProduct] = useState<ProductView | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  useEffect(() => { void listProducts().then(setProducts).catch(() => setLoadError('Não foi possível carregar os produtos.')); }, []);
  const categories = ['Todos', ...new Set(products.map((item) => item.category))];
  const visible = useMemo(() => products.filter((item) => item.active && (category === 'Todos' || item.category === category) && `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase())), [category, products, query]);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0); const count = cart.reduce((sum, line) => sum + line.quantity, 0); const received = Number(receivedText.replace(',', '.')) || 0; const canComplete = canCompleteSale(total, received, payment);
  function add(product: ProductView) {
    if (product.unit === 'KG') { setScaleProduct(product); return; }
    const found = cart.find((line) => line.product.id === product.id);
    const quantity = found?.quantity ?? 0;
    if (product.tracksStock && quantity >= product.stock) {
      setLoadError(`Estoque disponível de ${product.name}: ${product.stock} un.`);
      return;
    }
    setLoadError('');
    setCart(found
      ? cart.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...cart, { product, quantity: 1 }]);
  }
  function addWeight(product: ProductView, weight: number) {
    const found = cart.find((line) => line.product.id === product.id);
    const quantity = Number(((found?.quantity ?? 0) + weight).toFixed(3));
    if (product.tracksStock && quantity > product.stock) {
      setLoadError(`Estoque disponível de ${product.name}: ${product.stock.toFixed(3)} kg.`);
      return;
    }
    setLoadError('');
    setCart(found
      ? cart.map((line) => line.product.id === product.id ? { ...line, quantity } : line)
      : [...cart, { product, quantity: weight }]);
    setScaleProduct(null);
  }
  function change(id: number, delta: number) {
    const target = cart.find((line) => line.product.id === id);
    if (!target) return;
    const quantity = target.quantity + delta;
    if (delta > 0 && target.product.tracksStock && quantity > target.product.stock) {
      setLoadError(`Estoque disponível de ${target.product.name}: ${target.product.stock} un.`);
      return;
    }
    setLoadError('');
    setCart(cart.map((line) => line.product.id === id ? { ...line, quantity } : line)
      .filter((line) => line.quantity > 0));
  }
  function requestFinish() { setReceivedText(total.toFixed(2).replace('.', ',')); if (payment === 'Cartão') setTerminalOpen(true); else setPaymentOpen(true); }
  async function completeSale() { if (!canComplete || submitting) return; setSubmitting(true); setLoadError(''); try { const result = await createSale(crypto.randomUUID(), { items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })), paymentMethod: payment === 'Dinheiro' ? 'CASH' : payment === 'Pix' ? 'PIX' : 'CARD', ...(payment === 'Dinheiro' ? { receivedAmount: received } : {}) }); setCompletedSale({ saleId: result.id, orderNumber: result.code, completedAt: new Date(result.completedAt), lines: result.items.map((item) => ({ product: { id: item.productId, name: item.name, price: Number(item.unitPrice), unit: item.unit }, quantity: Number(item.quantity) })), total: Number(result.total), payment, received: Number(result.receivedAmount), change: Number(result.changeAmount) }); setProducts(await listProducts()); setPaymentOpen(false); setOrderOpen(false); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível concluir a venda.'); } finally { setSubmitting(false); } }
  function newSale() { setCompletedSale(null); setCart([]); setPayment('Dinheiro'); setReceivedText(''); setQuery(''); setCategory('Todos'); setTerminalOpen(false); }
  const order = <Order cart={cart} total={total} payment={payment} setPayment={setPayment} change={change} clear={() => setCart([])} onFinish={requestFinish} />;
  return <><PageHeader title="Frente de caixa" status={<Box sx={{ bgcolor: '#dbe4ea', px: 2, py: 1, fontWeight: 900 }}>PAGAMENTO MANUAL</Box>} />{loadError && <Box role='alert' sx={{ bgcolor: '#ffe0e0', border: '1px solid', borderColor: 'error.main', p: 1.5, mb: 1 }}>{loadError}</Box>}<Grid container spacing={1.5}><Grid size={{ xs: 12, md: 8 }}><TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto por nome ou código" slotProps={{ input: { startAdornment: <InputAdornment position="start"><OperationIcon name="search" /></InputAdornment> } }} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', lg: `repeat(${Math.min(categories.length, 6)},1fr)` }, gap: .5, my: 1.5 }}>{categories.map((item) => <Button key={item} onClick={() => setCategory(item)} variant="contained" sx={{ bgcolor: category === item ? moduleColors.pos : '#dce6ec', color: category === item ? '#fff' : 'text.primary' }}>{item}</Button>)}</Box><Grid container spacing={1}>{visible.map((product, index) => { const unavailable = product.tracksStock && product.stock <= 0; const unit = product.unit === 'KG' ? 'kg' : 'un.'; return <Grid key={product.id} size={{ xs: 6, sm: 4 }}><Button disabled={unavailable} onClick={() => add(product)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', width: '100%', minHeight: { xs: 174, sm: 205 }, p: 1.5, textAlign: 'left', color: '#fff', bgcolor: [moduleColors.pos, moduleColors.products, moduleColors.stock, '#7d3b87', '#477ba0'][index % 5], '&.Mui-disabled': { bgcolor: '#71808a', color: '#fff', opacity: .72 } }}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><OperationIcon name="product" size={44} /><Box sx={{ bgcolor: product.stock <= product.minimumStock ? '#ffcb2f' : '#fff', color: '#10213d', px: 1, py: .4, fontWeight: 900 }}>{unavailable ? 'SEM ESTOQUE' : `${product.stock} ${unit}`}</Box></Stack><Box><Typography sx={{ fontWeight: 900, fontSize: { xs: 15, sm: 18 }, lineHeight: 1.1 }}>{product.name}</Typography><Stack direction="row" sx={{ mt: .5, alignItems: 'center', justifyContent: 'space-between' }}><Typography sx={{ fontWeight: 900, fontSize: { xs: 20, sm: 24 } }}>{brl.format(product.price)} / {unit}</Typography><Box sx={{ border: '2px solid #fff', width: 42, height: 42, display: 'grid', placeItems: 'center' }}><OperationIcon name={unavailable ? 'lock' : 'plus'} /></Box></Stack></Box></Button></Grid>; })}</Grid></Grid>{!mobile && <Grid size={{ md: 4 }}>{order}</Grid>}</Grid>
    {mobile && <Stack direction="row" sx={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(70px + env(safe-area-inset-bottom))', zIndex: 1100, minHeight: 60, bgcolor: '#10213d', color: '#fff', alignItems: 'center', px: 1.5, gap: 1 }}><OperationIcon name="cart" /><Typography sx={{ fontWeight: 900 }}>{count} itens</Typography><Box sx={{ flex: 1 }} /><Typography sx={{ fontWeight: 900, fontSize: 19 }}>{brl.format(total)}</Typography><Button color="success" variant="contained" onClick={() => setOrderOpen(true)}>Ver pedido</Button></Stack>}
    <Dialog fullScreen open={mobile && orderOpen} onClose={() => setOrderOpen(false)}><DialogContent sx={{ p: 1.5 }}>{order}<Button fullWidth onClick={() => setOrderOpen(false)} sx={{ mt: 1 }}>Voltar aos produtos</Button></DialogContent></Dialog>
    <PaymentDialog open={paymentOpen} payment={payment} total={total} receivedText={receivedText} setReceivedText={setReceivedText} canComplete={canComplete} onClose={() => setPaymentOpen(false)} onConfirm={completeSale} />
    <PaymentTerminalDialog key={terminalOpen ? `${total}-open` : 'closed'} open={terminalOpen} total={total} submitting={submitting} onClose={() => setTerminalOpen(false)} onApproved={() => { setTerminalOpen(false); void completeSale(); }} />
    <ScaleDialog key={scaleProduct?.id ?? 'closed'} product={scaleProduct} onClose={() => setScaleProduct(null)} onConfirm={addWeight} />
    <SaleCompletionDialog sale={completedSale} onClose={() => setCompletedSale(null)} onNewSale={newSale} />
  </>;
}

function Order({ cart, total, payment, setPayment, change, clear, onFinish }: { cart: CartLine[]; total: number; payment: string; setPayment: (v: string) => void; change: (id: number, delta: number) => void; clear: () => void; onFinish: () => void }) { return <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', position: 'sticky', top: 8 }}><SectionHeader action={<Button color="inherit" variant="outlined" onClick={clear}>Limpar</Button>}>Pedido atual</SectionHeader><Typography sx={{ px: 2, py: 1, fontWeight: 800 }}>{cart.length} produtos no pedido</Typography><Divider /><Stack sx={{ maxHeight: 370, overflow: 'auto' }}>{cart.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>Selecione produtos para iniciar o pedido.</Typography> : cart.map((line) => <Stack key={line.product.id} direction="row" sx={{ minHeight: 74, alignItems: 'center', px: 1.5, borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}><OperationIcon name="product" /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900 }}>{line.product.name}</Typography><Typography sx={{ fontWeight: 800 }}>{line.product.unit === 'KG' ? `${line.quantity.toFixed(3)} kg · ` : ''}{brl.format(line.product.price * line.quantity)}</Typography></Box>{line.product.unit === 'KG' ? <Button onClick={() => change(line.product.id, -line.quantity)}>Remover</Button> : <><Button onClick={() => change(line.product.id, -1)}><OperationIcon name="minus" /></Button><Typography sx={{ fontWeight: 900 }}>{line.quantity}</Typography><Button onClick={() => change(line.product.id, 1)}><OperationIcon name="plus" /></Button></>}</Stack>)}</Stack><Box sx={{ p: 1.5 }}><Stack direction="row" sx={{ justifyContent: 'space-between', py: 1 }}><Typography>Subtotal</Typography><Typography sx={{ fontWeight: 900 }}>{brl.format(total)}</Typography></Stack><Stack direction="row" sx={{ bgcolor: '#10213d', color: '#fff', justifyContent: 'space-between', p: 1.5 }}><Typography variant="h6">Total</Typography><Typography sx={{ fontWeight: 900, fontSize: 26 }}>{brl.format(total)}</Typography></Stack><TextField select fullWidth label="Forma de pagamento" value={payment} onChange={(e) => setPayment(e.target.value)} sx={{ my: 1.5 }} slotProps={{ select: { native: true } }}><option>Dinheiro</option><option>Pix</option><option>Cartão</option></TextField><Button fullWidth size="large" color="success" variant="contained" disabled={!cart.length} onClick={onFinish} startIcon={<OperationIcon name="pos" />}>Finalizar venda</Button><Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>Venda e estoque serão registrados após a confirmação.</Typography></Box></Box>; }

function PaymentDialog({ open, payment, total, receivedText, setReceivedText, canComplete, onClose, onConfirm }: { open: boolean; payment: string; total: number; receivedText: string; setReceivedText: (value: string) => void; canComplete: boolean; onClose: () => void; onConfirm: () => void }) { const received = Number(receivedText.replace(',', '.')) || 0; return <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"><DialogTitle sx={{ bgcolor: moduleColors.header, color: '#fff', fontWeight: 900 }}>Confirmar pagamento</DialogTitle><DialogContent><Stack sx={{ gap: 2, pt: 2 }}><Box sx={{ bgcolor: moduleColors.overview, color: '#fff', p: 2 }}><Typography>Total a receber</Typography><Typography sx={{ fontWeight: 900, fontSize: 34 }}>{brl.format(total)}</Typography></Box><Typography sx={{ fontWeight: 900 }}>Forma de pagamento: {payment}</Typography>{payment === 'Dinheiro' && <TextField autoFocus label="Valor recebido" value={receivedText} onChange={(e) => setReceivedText(e.target.value)} inputMode="decimal" error={received > 0 && received < total} helperText={received < total ? `Faltam ${brl.format(total - received)}` : `Troco: ${brl.format(calculateChange(total, received, payment))}`} />}<Box sx={{ bgcolor: '#fff0bd', border: '1px solid #cf8b00', p: 1.5 }}><Typography sx={{ fontWeight: 900 }}>Modo demonstração</Typography><Typography variant="body2">Pagamento manual: não há confirmação automática de banco ou operadora.</Typography></Box></Stack></DialogContent><DialogActions><Button onClick={onClose}>Voltar</Button><Button color="success" variant="contained" disabled={!canComplete} onClick={onConfirm}>Concluir venda</Button></DialogActions></Dialog>; }

function ScaleDialog({ product, onClose, onConfirm }: { product: ProductView | null; onClose: () => void; onConfirm: (product: ProductView, weight: number) => void }) {
  const [grossText, setGrossText] = useState('0,350');
  const [tareText, setTareText] = useState('0,000');
  if (!product) return null;
  const gross = Number(grossText.replace(',', '.')) || 0;
  const tare = Number(tareText.replace(',', '.')) || 0;
  const net = Number(Math.max(0, gross - tare).toFixed(3));
  const valid = gross > 0 && tare >= 0 && tare < gross && net <= product.stock;
  return <Dialog open onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ bgcolor: moduleColors.header, color: '#fff', fontWeight: 900 }}>Leitura da balança</DialogTitle>
    <DialogContent><Stack sx={{ gap: 2, pt: 2 }}>
      <Box sx={{ bgcolor: '#fff0bd', border: '1px solid #cf8b00', p: 1.5 }}>
        <Typography sx={{ fontWeight: 900 }}>SIMULAÇÃO MANUAL — NÃO HOMOLOGADA</Typography>
        <Typography variant="body2">A futura balança física preencherá estes dados automaticamente.</Typography>
      </Box>
      <Typography variant="h6">{product.name}</Typography>
      <Stack direction="row" sx={{ gap: 1 }}>
        <TextField autoFocus label="Peso bruto (kg)" value={grossText} inputMode="decimal" onChange={(event) => setGrossText(event.target.value)} />
        <TextField label="Tara (kg)" value={tareText} inputMode="decimal" onChange={(event) => setTareText(event.target.value)} />
      </Stack>
      <Box sx={{ bgcolor: valid ? '#d9f2e7' : '#ffe0e0', border: '2px solid', borderColor: valid ? 'success.main' : 'error.main', p: 2, textAlign: 'center' }}>
        <Typography>PESO LÍQUIDO</Typography><Typography sx={{ fontSize: 40, fontWeight: 900 }}>{net.toFixed(3)} kg</Typography>
        <Typography sx={{ fontWeight: 900 }}>{brl.format(product.price)}/kg · Total {brl.format(product.price * net)}</Typography>
      </Box>
      <Typography variant="caption">Origem: SIMULATED_MANUAL · Estoque disponível: {product.stock.toFixed(3)} kg</Typography>
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose}>Cancelar</Button><Button color="success" variant="contained" disabled={!valid} onClick={() => onConfirm(product, net)}>Adicionar ao pedido</Button></DialogActions>
  </Dialog>;
}
