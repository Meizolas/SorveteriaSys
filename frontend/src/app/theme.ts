import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6d3bd1', light: '#eee8ff', dark: '#4e24a8', contrastText: '#ffffff' },
    secondary: { main: '#ef6c54', light: '#fff0ed', dark: '#b94835', contrastText: '#ffffff' },
    error: { main: '#b3261e' },
    warning: { main: '#d98b18', light: '#f7dcae', dark: '#8d5808' },
    success: { main: '#16886f' },
    background: { default: '#f7f7fa', paper: '#ffffff' },
    text: { primary: '#20202a', secondary: '#6f6d7a' },
    divider: '#e9e7ee'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.035em' },
    h5: { fontWeight: 800, letterSpacing: '-0.025em' },
    h6: { fontWeight: 750, letterSpacing: '-0.015em' },
    button: { fontWeight: 700, textTransform: 'none' },
    overline: { fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em' }
  },
  components: {
    MuiButtonBase: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #005fcc', outlineOffset: 2 } } } },
    MuiLink: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #005fcc', outlineOffset: 2 } } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 9, minHeight: 40, paddingInline: 18 } } },
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e9e7ee', borderRadius: 16 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiLinearProgress: { styleOverrides: { root: { height: 7, borderRadius: 8, backgroundColor: '#eeeef3' }, bar: { borderRadius: 8 } } }
  }
});

