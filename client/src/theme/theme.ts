import { createTheme } from '@mui/material/styles';

// Renk paletini tanımlayalım
const colors = {
    primary: {
        main: '#243ce6',
        light: '#4a5ef0',
        dark: '#1c30b8',
        contrastText: '#fff',
    },
    secondary: {
        main: '#161e29',
        light: '#222d3e',
        dark: '#0d121a',
        contrastText: '#fff',
    },
    background: {
        default: '#f8f9fa',
        paper: '#ffffff',
    },
    text: {
        primary: '#161e29',
        secondary: '#6b7280',
    },
    error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#fff',
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#fff',
    },
    info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#fff',
    },
    success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#fff',
    },
};

// Theme oluşturalım
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: colors.primary,
        secondary: colors.secondary,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        success: colors.success,
        background: colors.background,
        text: colors.text,
    },
    typography: {
        fontFamily: [
            'Gilroy',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 600,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'medium',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});

export default theme; 