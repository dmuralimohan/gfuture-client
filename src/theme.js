import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#03288C',
      dark: '#021A66',
      light: '#1a56c4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5a6a80',
      light: '#1a56c4',
    },
    background: {
      default: '#f0f4ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0E0E2E',
      secondary: '#5a6a80',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: "'Poppins', sans-serif",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 28px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(15, 43, 102, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #03288C 0%, #1a56c4 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #021A66 0%, #2d8bc4 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(15, 43, 102, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 40px rgba(15, 43, 102, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

export default theme;

