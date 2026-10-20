import { useState, type ReactNode } from 'react';
import {
  AppBar, Avatar, Box, Button, Chip, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemText, Stack, Toolbar, Tooltip, Typography, useMediaQuery, useTheme
} from '@mui/material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/AuthProvider';

const drawerWidth = 248;
const navItems = [
  { path: '/', label: 'Visão geral', icon: '⌂' },
  { path: '/pdv', label: 'Frente de caixa', icon: '▦' },
  { path: '/produtos', label: 'Produtos', icon: '◇' },
  { path: '/estoque', label: 'Estoque', icon: '≋' },
  { path: '/caixa', label: 'Caixa', icon: '◫' }
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={1.4} sx={{ px: 2.5, height: 76, alignItems: 'center' }}>
        <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 2.5, fontWeight: 900, fontSize: 18 }}>S</Box>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>Sorvete ERP</Typography>
          <Typography variant="caption" color="text.secondary">Gestão de balcão</Typography>
        </Box>
      </Stack>
      <Divider />
      <Typography variant="overline" color="text.secondary" sx={{ px: 2.5, pt: 2.5, pb: 1 }}>Operação</Typography>
      <List sx={{ px: 1.5, py: 0 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            sx={{ mb: .5, borderRadius: 2.5, gap: 1.5, '&.active': { bgcolor: 'primary.50', color: 'primary.main' } }}
          >
            <Box aria-hidden sx={{ width: 28, textAlign: 'center', fontSize: 21, fontWeight: 700 }}>{item.icon}</Box>
            <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 650 } } }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ m: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Servidor conectado</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Ambiente local</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function AppShell() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = navItems.find((item) => item.path === location.pathname)?.label ?? 'Sorvete ERP';
  const userName = session?.user.displayName ?? 'Operador';

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} color="inherit" sx={{ ml: { md: `${drawerWidth}px` }, width: { md: `calc(100% - ${drawerWidth}px)` }, borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: '76px !important', px: { xs: 2, md: 3.5 } }}>
          {mobile && <IconButton onClick={() => setOpen(true)} aria-label="Abrir menu" sx={{ mr: 1 }}>☰</IconButton>}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">Terça-feira, 20 de outubro</Typography>
          </Box>
          <Chip label="Caixa fechado" size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'flex' }, mr: 2, color: 'warning.dark', borderColor: 'warning.light', bgcolor: 'warning.50' }} />
          <Tooltip title="Sair">
            <Button onClick={() => void handleLogout()} color="inherit" sx={{ minWidth: 0, gap: 1, px: 1 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>{userName.slice(0, 2).toUpperCase()}</Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'none' }}>{userName}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none' }}>Administrador</Typography>
              </Box>
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant={mobile ? 'temporary' : 'permanent'} open={mobile ? open : true} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRightColor: 'divider' } }}>
          <Navigation onNavigate={() => setOpen(false)} />
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, pt: '76px' }}>
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1500, mx: 'auto' }}><Outlet /></Box>
      </Box>
    </Box>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}>
    <Box>{eyebrow && <Typography variant="overline" color="primary.main">{eyebrow}</Typography>}<Typography variant="h4">{title}</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>{description}</Typography></Box>
    {action}
  </Stack>;
}
