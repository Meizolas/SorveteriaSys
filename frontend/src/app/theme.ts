import { createTheme } from '@mui/material/styles';
export const moduleColors = { overview: '#123849', pos: '#0877e8', products: '#008f83', stock: '#cf8b00', cash: '#d82929', header: '#005b5b', ink: '#0b2145', canvas: '#eef7fb' } as const;
export const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#0877e8' }, secondary: { main: '#008f83' }, success: { main: '#008b5c' }, warning: { main: '#cf8b00' }, error: { main: '#d82929' }, background: { default: moduleColors.canvas, paper: '#fff' }, text: { primary: moduleColors.ink, secondary: '#41546c' }, divider: '#b7c9d5' },
  shape: { borderRadius: 0 },
  typography: { fontFamily: '"Arial Narrow", "Roboto Condensed", Arial, sans-serif', h4: { fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase' }, h5: { fontWeight: 900 }, h6: { fontWeight: 900, textTransform: 'uppercase' }, button: { fontWeight: 900, textTransform: 'uppercase' }, overline: { fontWeight: 900, letterSpacing: '.08em' } },
  components: {
    MuiCssBaseline: { styleOverrides: { '*': { boxSizing: 'border-box' }, body: { overflowX: 'hidden' }, '::selection': { background: '#0877e8', color: '#fff' } } },
    MuiButtonBase: { styleOverrides: { root: { minWidth: 48, minHeight: 48, '&:focus-visible': { outline: '3px solid #ff9d18', outlineOffset: 2 } } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 48, borderRadius: 0, paddingInline: 18 }, sizeLarge: { minHeight: 56 } } },
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #b7c9d5', borderRadius: 0, boxShadow: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 0, fontWeight: 900, textTransform: 'uppercase' } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0, minHeight: 48 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 0, border: '2px solid #123849' } } },
    MuiTableCell: { styleOverrides: { head: { background: '#123849', color: '#fff', fontWeight: 900 }, root: { borderColor: '#d5e1e8' } } }
  }
});
