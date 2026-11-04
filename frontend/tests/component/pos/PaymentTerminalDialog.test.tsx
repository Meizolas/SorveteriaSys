import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentTerminalDialog } from '@/features/pos/PaymentTerminalDialog';

describe('PaymentTerminalDialog', () => {
  afterEach(cleanup);

  it('só permite registrar a venda depois da aprovação simulada', () => {
    const onApproved = vi.fn();
    render(<PaymentTerminalDialog open total={42.5} submitting={false} onClose={vi.fn()} onApproved={onApproved} />);
    expect(screen.getByText('SIMULADOR — NÃO HOMOLOGADO')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Concluir venda' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar cobrança' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular aprovação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir venda' }));
    expect(onApproved).toHaveBeenCalledOnce();
  });

  it('permite tentar novamente após recusa sem concluir a venda', () => {
    const onApproved = vi.fn();
    render(<PaymentTerminalDialog open total={18} submitting={false} onClose={vi.fn()} onApproved={onApproved} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar cobrança' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular recusa' }));
    expect(screen.getByText('Pagamento recusado')).toBeVisible();
    expect(onApproved).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByText('Terminal pronto')).toBeVisible();
  });
});
