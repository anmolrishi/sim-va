import { createTheme, alpha } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/lab/themeAugmentation';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      main: string;
      darker: string;
      lighter: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      main: string;
      darker: string;
      lighter: string;
    };
  }

  interface TypeBackground {
    neutral: string;
  }
}

// Custom color definitions
const PRIMARY = {
  lighter: '#F5F6FF',
  light: '#DEE2FC',
  main: '#444CE7',
  dark: '#3538CD',
  darker: '#2D31A6',
};

const SECONDARY = {
  lighter: '#F9FAFB',
  light: '#F3F4F6',
  main: '#6D7295',
  dark: '#4B4F6B',
  darker: '#2D3049',
};

const SUCCESS = {
  lighter: '#ECFDF3',
  light: '#6CE9A6',
  main: '#027A48',
  dark: '#05603A',
  darker: '#054F31',
};

const WARNING = {
  lighter: '#FFFAEB',
  light: '#FEC84B',
  main: '#B54708',
  dark: '#93370D',
  darker: '#7A2E0E',
};

const ERROR = {
  lighter: '#FEF3F2',
  light: '#FDA29B',
  main: '#B42318',
  dark: '#912018',
  darker: '#7A271A',
};

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F3F4F6',
  300: '#E5E7EB',
  400: '#D1D5DB',
  500: '#9CA3AF',
  600: '#6B7280',
  700: '#4B5563',
  800: '#1F2937',
  900: '#111827',
};

const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  neutral: {
    main: GREY[500],
    darker: GREY[700],
    lighter: GREY[200],
  },
  action: {
    active: GREY[600],
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    ...COMMON,
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
    },
    background: {
      paper: '#FFFFFF',
      default: '#FFFFFF',
      neutral: GREY[100],
    },
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(16, 24, 40, 0.05)',
    '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
    '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
    '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
    '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
    ...Array(18).fill('none'),
  ],
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: PRIMARY.main,
          '&:hover': {
            backgroundColor: PRIMARY.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
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
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${GREY[200]}`,
        },
        head: {
          backgroundColor: GREY[100],
          color: GREY[600],
          fontWeight: 500,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '.keyword-highlight': {
          color: 'green',
          backgroundColor: '#ccffd1',
        },
      },
    },
  },
});

export default theme;