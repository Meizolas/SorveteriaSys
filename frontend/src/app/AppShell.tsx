import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { moduleColors } from './theme';
import { OperationIcon, type OperationIconName } from '@/shared/ui/OperationIcon';

const navigation: { path: string; label: string; short: string; color: string; icon: OperationIconName; permission?: string }[] = [
  { path: '/', label: 'Visão geral', short: 'Início', color: moduleColors.overview, icon: 'home' },
  { path: '/pdv', label: 'Frente de caixa', short: 'PDV', color: moduleColors.pos, icon: 'pos' },
  { path: '/vendas', label: 'Vendas', short: 'Vendas', color: '#50697a', icon: 'receipt' },
  { path: '/produtos', label: 'Produtos', short: 'Produtos', color: moduleColors.products, icon: 'product' },
  { path: '/estoque', label: 'Estoque', short: 'Estoque', color: moduleColors.stock, icon: 'stock' },
  { path: '/caixa', label: 'Caixa', short: 'Caixa', color: moduleColors.cash, icon: 'cash' },
  { path: '/relatorios', label: 'Relatórios', short: 'Relat.', color: '#5b657d', icon: 'chart' },
  { path: '/usuarios', label: 'Usuários', short: 'Equipe', color: '#315b70', icon: 'user', permission: 'USER_READ' },
  { path: '/configuracao', label: 'Configuração', short: 'Loja', color: '#3d5266', icon: 'server', permission: 'STORE_READ' },
  { path: '/auditoria', label: 'Auditoria', short: 'Auditar', color: '#604f70', icon: 'audit', permission: 'AUDIT_READ' }
];

export function AppShell() {
  const theme = useTheme(); const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { session, signOut } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const visibleNavigation = navigation.filter((item) => !item.permission || session?.permissions.includes(item.permission));
  const now = new Date(); const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia' }).format(now);
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia' }).format(now);
  async function logout() { await signOut(); navigate('/login'); }
  return <Box sx={{ minHeight: '100vh', pb: { xs: 'calc(72px + env(safe-area-inset-bottom))', sm: 0 } }}>
    <Box component="header" sx={{ bgcolor: moduleColors.header, color: '#fff', minHeight: { xs: 78, sm: 86 }, display: 'flex', alignItems: 'center', px: { xs: 2, md: 3 } }}>
      <Box component="img" src="/brand/sorve-logo.png" alt="Sorvê — Gestão de balcão" sx={{ width: { xs: 142, sm: 176 }, height: 66, objectFit: 'contain', objectPosition: 'left center' }} />
      <Box sx={{ flex: 1 }} />
      <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 1, sm: 2 }, fontWeight: 700 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}><OperationIcon name="user" size={28} /><Typography sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 800 }}>{session?.user.displayName ?? 'Operador'}</Typography></Stack>
        <Box sx={{ height: 34, borderLeft: '1px solid rgba(255,255,255,.65)' }} />
        <Typography variant="body2" sx={{ fontWeight: 800 }}>{date}</Typography>
        <Box sx={{ height: 34, borderLeft: '1px solid rgba(255,255,255,.65)', display: { xs: 'none', sm: 'block' } }} />
        <Button color="inherit" onClick={() => void logout()} sx={{ display: { xs: 'none', sm: 'inline-flex' }, minWidth: 64 }}>{time}</Button>
      </Stack>
    </Box>
    {!mobile && <Box component="nav" aria-label="Navegação principal" sx={{ display: 'grid', gridTemplateColumns: `repeat(${visibleNavigation.length}, 1fr)`, borderBottom: '1px solid #fff' }}>{visibleNavigation.map((item) => <NavBlock key={item.path} {...item} active={location.pathname === item.path} />)}</Box>}
    <Box component="main" sx={{ px: { xs: 1.5, sm: 2.5 }, py: { xs: 2, sm: 2.5 }, maxWidth: 1600, mx: 'auto' }}><Outlet /></Box>
    {!mobile && <Box component="footer" sx={{ minHeight: 38, borderTop: '1px solid', borderColor: 'divider', px: 2.5, display: 'flex', alignItems: 'center', bgcolor: '#f7fbfd' }}><Typography variant="caption" sx={{ fontWeight: 700 }}>Ambiente local</Typography><Box sx={{ flex: 1 }} /><Typography variant="caption">Sorvê · MVP</Typography></Box>}
    {mobile && <Box component="nav" aria-label="Navegação principal" sx={{ position: 'fixed', zIndex: 1200, left: 0, right: 0, bottom: 0, pb: 'env(safe-area-inset-bottom)', bgcolor: moduleColors.overview, display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(68px, 1fr)', overflowX: 'auto', borderTop: '2px solid #fff' }}>{visibleNavigation.map((item) => <NavBlock key={item.path} {...item} active={location.pathname === item.path} mobile />)}</Box>}
  </Box>;
}

function NavBlock({ path, label, short, color, icon, active, mobile = false }: { path: string; label: string; short: string; color: string; icon: OperationIconName; active: boolean; mobile?: boolean }) {
  return <Box component={NavLink} to={path} aria-current={active ? 'page' : undefined} sx={{ minWidth: 0, minHeight: mobile ? 70 : 94, bgcolor: color, color: '#fff', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRight: '1px solid rgba(255,255,255,.8)', '&:after': active ? { content: '""', position: 'absolute', left: mobile ? 7 : 4, right: mobile ? 7 : 4, bottom: mobile ? 'auto' : 3, top: mobile ? 0 : 'auto', height: 4, bgcolor: '#fff' } : {} }}><OperationIcon name={icon} size={mobile ? 29 : 38} /><Typography sx={{ mt: .4, fontWeight: 900, fontSize: mobile ? 11 : 16, lineHeight: 1.05, textAlign: 'center' }}>{mobile ? short : label}</Typography></Box>;
}

export function PageHeader({ title, description, action, status }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; status?: ReactNode }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}><Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'baseline' }, gap: { md: 2 } }}><Typography variant="h4">{title}</Typography>{description && <Typography color="text.secondary" sx={{ borderLeft: { md: '1px solid' }, pl: { md: 2 } }}>{description}</Typography>}</Stack><Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>{status}{action}</Stack></Stack>;
}
