import { Navigate, createBrowserRouter } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';
import { RequireSession } from '@/features/auth/RequireSession';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ModulePreviewPage } from '@/shared/ui/ModulePreviewPage';
import { AppShell } from './AppShell';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/trocar-senha', element: <ChangePasswordPage /> },
  {
    element: <RequireSession />,
    children: [{
      element: <AppShell />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/pdv', element: <ModulePreviewPage eyebrow="Venda rápida" title="Frente de caixa" description="Monte pedidos e finalize pagamentos com agilidade." action="Iniciar venda" icon="▦" steps={['Buscar e adicionar produtos', 'Revisar quantidades e totais', 'Receber e concluir a venda']} /> },
        { path: '/produtos', element: <ModulePreviewPage eyebrow="Catálogo" title="Produtos" description="Organize o cardápio, preços e disponibilidade." action="Novo produto" icon="◇" steps={['Cadastrar categorias', 'Definir preço e unidade', 'Ativar produtos para venda']} /> },
        { path: '/estoque', element: <ModulePreviewPage eyebrow="Controle" title="Estoque" description="Acompanhe saldos, entradas e alertas de reposição." action="Nova movimentação" icon="≋" steps={['Consultar saldos atuais', 'Registrar entradas e ajustes', 'Acompanhar estoque mínimo']} /> },
        { path: '/caixa', element: <ModulePreviewPage eyebrow="Financeiro operacional" title="Caixa" description="Controle turnos, movimentos e fechamento diário." action="Abrir caixa" icon="◫" steps={['Informar saldo inicial', 'Acompanhar recebimentos', 'Conferir e fechar o turno']} /> }
      ]
    }]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

