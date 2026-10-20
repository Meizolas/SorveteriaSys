import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OperatorHomePage } from '@/app/OperatorHomePage';

describe('OperatorHomePage', () => {
  it('identifica a tela inicial para o operador', () => {
    render(<OperatorHomePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Sistema da sorveteria' })).toBeVisible();
    expect(screen.getByText('Você entrou no ambiente interno.')).toBeVisible();
  });
});
