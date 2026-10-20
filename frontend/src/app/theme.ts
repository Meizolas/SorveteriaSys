import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5b2a86', contrastText: '#ffffff' },
    secondary: { main: '#a33c00', contrastText: '#ffffff' },
    error: { main: '#b3261e' },
    background: { default: '#faf7fc' }
  },
  typography: { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  components: {
    MuiButtonBase: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #005fcc', outlineOffset: 2 } } } },
    MuiLink: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #005fcc', outlineOffset: 2 } } } }
  }
});

