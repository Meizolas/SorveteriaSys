import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { moduleColors } from '@/app/theme';
import { brl } from '@/shared/demo/demoData';
import { OperationIcon } from '@/shared/ui/OperationIcon';

type TerminalPhase = 'READY' | 'PROCESSING' | 'APPROVED' | 'DECLINED';
type CardMode = 'Crédito' | 'Débito';

type Props = { open: boolean; total: number; submitting: boolean; onClose: () => void; onApproved: () => void };

const phasePresentation: Record<TerminalPhase, { title: string; message: string; color: string; background: string }> = {
  READY: { title: 'Terminal pronto', message: 'Selecione a modalidade e inicie a cobrança.', color: '#10213d', background: '#e5edf2' },
  PROCESSING: { title: 'Aguardando operadora', message: 'Simule a resposta que seria recebida da maquininha.', color: '#664500', background: '#fff0bd' },
  APPROVED: { title: 'Pagamento aprovado', message: 'A venda já pode ser registrada no sistema.', color: '#075c3b', background: '#d9f2e7' },
  DECLINED: { title: 'Pagamento recusado', message: 'Tente novamente ou volte ao pedido sem perder os itens.', color: '#8a1c1c', background: '#ffe0e0' }
};

export function PaymentTerminalDialog({ open, total, submitting, onClose, onApproved }: Props) {
  const [phase, setPhase] = useState<TerminalPhase>('READY');
  const [cardMode, setCardMode] = useState<CardMode>('Crédito');
  const presentation = phasePresentation[phase];

  return <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ bgcolor: moduleColors.header, color: '#fff', fontWeight: 900 }}>Pagamento no cartão</DialogTitle>
    <DialogContent><Stack sx={{ gap: 2, pt: 2 }}>
      <Box sx={{ bgcolor: '#fff0bd', border: '1px solid #cf8b00', p: 1.5 }}>
        <Typography sx={{ fontWeight: 900 }}>SIMULADOR — NÃO HOMOLOGADO</Typography>
        <Typography variant="body2">Nenhuma cobrança real é feita e nenhum dado de cartão é coletado.</Typography>
      </Box>
      <Box sx={{ bgcolor: moduleColors.overview, color: '#fff', p: 2 }}>
        <Typography>Valor da transação</Typography><Typography sx={{ fontWeight: 900, fontSize: 34 }}>{brl.format(total)}</Typography>
      </Box>
      <TextField select label="Modalidade" value={cardMode} disabled={phase !== 'READY'} onChange={(event) => setCardMode(event.target.value as CardMode)}>
        <MenuItem value="Crédito">Crédito</MenuItem><MenuItem value="Débito">Débito</MenuItem>
      </TextField>
      <Box role="status" sx={{ bgcolor: presentation.background, color: presentation.color, border: '2px solid currentColor', p: 2, textAlign: 'center' }}>
        <OperationIcon name={phase === 'APPROVED' ? 'check' : phase === 'DECLINED' ? 'close' : 'pos'} size={36} />
        <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{presentation.title}</Typography><Typography variant="body2">{presentation.message}</Typography>
      </Box>
      <Typography variant="caption">Modalidade: {cardMode} · Integração: SIMULATED_TERMINAL</Typography>
    </Stack></DialogContent>
    <DialogActions sx={{ flexWrap: 'wrap' }}>
      {phase === 'READY' && <><Button onClick={onClose}>Voltar</Button><Button variant="contained" onClick={() => setPhase('PROCESSING')}>Iniciar cobrança</Button></>}
      {phase === 'PROCESSING' && <><Button color="error" variant="outlined" onClick={() => setPhase('DECLINED')}>Simular recusa</Button><Button color="success" variant="contained" onClick={() => setPhase('APPROVED')}>Simular aprovação</Button></>}
      {phase === 'DECLINED' && <><Button onClick={onClose}>Voltar ao pedido</Button><Button variant="contained" onClick={() => setPhase('READY')}>Tentar novamente</Button></>}
      {phase === 'APPROVED' && <Button color="success" variant="contained" disabled={submitting} onClick={onApproved}>{submitting ? 'Registrando venda...' : 'Concluir venda'}</Button>}
    </DialogActions>
  </Dialog>;
}
