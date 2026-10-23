import { Navigate, createBrowserRouter } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';
import { RequireSession } from '@/features/auth/RequireSession';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProductsPage } from '@/features/catalog/ProductsPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { CashPage } from '@/features/cash/CashPage';
import { PosPage } from '@/features/pos/PosPage';
import { SalesHistoryPage } from '@/features/sales/SalesHistoryPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { UserListPage } from '@/features/users/UserListPage';
import { StoreConfigurationPage } from '@/features/store/StoreConfigurationPage';
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
        { path: '/pdv', element: <PosPage /> },
        { path: '/vendas', element: <SalesHistoryPage /> },
        { path: '/produtos', element: <ProductsPage /> },
        { path: '/estoque', element: <InventoryPage /> },
        { path: '/caixa', element: <CashPage /> },
        { path: '/relatorios', element: <ReportsPage /> },
        { path: '/usuarios', element: <UserListPage /> },
        { path: '/configuracao', element: <StoreConfigurationPage /> }
      ]
    }]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

