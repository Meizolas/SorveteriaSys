import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '@/features/auth/AuthProvider';
import { brl } from '@/shared/demo/demoData';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import { moduleColors } from '@/app/theme';

export type CompletedSale = { orderNumber: string; completedAt: Date; lines: { product: { id: number; name: string; price: number }; quantity: number }[]; total: number; payment: string; received: number; change: number };

export function SaleCompletionDialog({ sale, onClose, onNewSale }: { sale: CompletedSale | null; onClose: () => void; onNewSale: () => void }) {
  const mobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const { session } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [printRequested, setPrintRequested] = useState(false);
  if (!sale) return null;
  const operator = session?.user.displayName ?? 'Operador';
  const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia' }).format(sale.completedAt);
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia' }).format(sale.completedAt);
  function printReceipt() { setPrintRequested(true); window.setTimeout(() => window.print(), 50); }
  return <>
    <style>{`@media print { @page { size: 80mm auto; margin: 0; } body * { visibility: hidden !important; } .sorve-print-receipt, .sorve-print-receipt * { visibility: visible !important; } .sorve-print-receipt { position: fixed !important; left: 0 !important; top: 0 !important; width: 80mm !important; border: 0 !important; } }`}</style>
    <Dialog open onClose={onClose} fullScreen={mobile} fullWidth maxWidth="md" aria-labelledby="sale-complete-title" slotProps={{ paper: { sx: { bgcolor: '#fff' } } }}>
      <Box sx={{ bgcolor: '#008b5c', color: '#fff', p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#fff', color: '#008b5c', width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center' }}><OperationIcon name="check" size={36} /></Box>
        <Box sx={{ flex: 1 }}><Typography id="sale-complete-title" variant="h4" sx={{ fontSize: { xs: 24, sm: 32 } }}>Venda concluída</Typography><Typography sx={{ fontWeight: 800 }}>Pedido #{sale.orderNumber} · {date} às {time}</Typography></Box>
        <Button color="inherit" onClick={onClose} aria-label="Fechar"><OperationIcon name="close" size={30} /></Button>
      </Box>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}><Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}><Typography variant="h6">Prévia do comprovante</Typography><Box sx={{ bgcolor: '#dce6ec', px: 3, py: .5, fontWeight: 900 }}>80 mm</Box></Stack><ReceiptPreview sale={sale} operator={operator} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Stack sx={{ gap: 1 }}>
            <Box sx={{ bgcolor: moduleColors.overview, color: '#fff', p: 2 }}><Typography variant="h6">Total da venda</Typography><Typography sx={{ fontWeight: 900, fontSize: 40, lineHeight: 1 }}>{brl.format(sale.total)}</Typography></Box>
            <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}><Typography sx={{ fontWeight: 900 }}>{sale.payment}</Typography>{sale.payment === 'Dinheiro' && <><SummaryRow label="Recebido" value={brl.format(sale.received)} /><SummaryRow label="Troco" value={brl.format(sale.change)} /></>}</Box>
            <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, fontWeight: 900 }}><OperationIcon name="print" />{printRequested ? 'Impressão solicitada' : 'Ainda não impresso'}</Box>
            <Button size="large" variant="contained" onClick={printReceipt} startIcon={<OperationIcon name="print" />}>Imprimir comprovante</Button>
            <Button size="large" variant="contained" sx={{ bgcolor: moduleColors.header }} onClick={() => setExpanded(true)} startIcon={<OperationIcon name="zoom" />}>Ampliar prévia</Button>
            <Button size="large" color="success" variant="contained" onClick={onNewSale} startIcon={<OperationIcon name="plus" />}>Nova venda</Button>
            <Typography variant="caption" sx={{ textAlign: 'center' }}>Venda demonstrativa. Nenhum registro, pagamento ou estoque foi alterado.</Typography>
          </Stack></Grid>
        </Grid>
      </DialogContent>
    </Dialog>
    <Dialog open={expanded} onClose={() => setExpanded(false)} fullScreen={mobile} fullWidth maxWidth="sm"><Box sx={{ bgcolor: moduleColors.header, color: '#fff', p: 1, display: 'flex', alignItems: 'center' }}><Typography variant="h6" sx={{ flex: 1 }}>Comprovante ampliado</Typography><Button color="inherit" onClick={() => setExpanded(false)} aria-label="Fechar prévia"><OperationIcon name="close" /></Button></Box><DialogContent><ReceiptPreview sale={sale} operator={operator} large /></DialogContent></Dialog>
  </>;
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <Stack direction="row" sx={{ justifyContent: 'space-between', mt: .5 }}><Typography>{label}</Typography><Typography sx={{ fontWeight: 900 }}>{value}</Typography></Stack>; }

function ReceiptPreview({ sale, operator, large = false }: { sale: CompletedSale; operator: string; large?: boolean }) {
  const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' }).format(sale.completedAt);
  return <Box className="sorve-print-receipt" sx={{ bgcolor: '#fff', color: '#111', border: '1px solid #9aa8b2', width: '100%', maxWidth: large ? 420 : 310, mx: 'auto', p: 2, fontFamily: 'monospace', fontSize: large ? 15 : 12 }}>
    <Box component="img" src="/brand/sorve-logo.png" alt="Sorvê" sx={{ width: 110, height: 48, objectFit: 'contain', display: 'block', mx: 'auto', bgcolor: moduleColors.header, px: 1 }} />
    <Typography sx={{ fontFamily: 'inherit', fontWeight: 900, textAlign: 'center', mt: 1 }}>COMPROVANTE DO PEDIDO</Typography><Typography sx={{ fontFamily: 'inherit', fontWeight: 900, textAlign: 'center' }}>SEM VALOR FISCAL</Typography>
    <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#111' }} />
    <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>Pedido: #{sale.orderNumber}</Typography><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>{dateTime}</Typography><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>Operador: {operator}</Typography>
    <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#111' }} />
    {sale.lines.map((line) => <Stack key={line.product.id} direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>{line.quantity} x {line.product.name}</Typography><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', whiteSpace: 'nowrap' }}>{brl.format(line.product.price * line.quantity)}</Typography></Stack>)}
    <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#111' }} /><SummaryRow label="TOTAL" value={brl.format(sale.total)} /><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', mt: 1 }}>Pagamento: {sale.payment}</Typography>{sale.payment === 'Dinheiro' && <><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>Recebido: {brl.format(sale.received)}</Typography><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>Troco: {brl.format(sale.change)}</Typography></>}
    <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#111' }} /><Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }}>Obrigado pela preferência!</Typography>
  </Box>;
}
