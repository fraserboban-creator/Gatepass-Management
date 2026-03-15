// Modern SaaS Dashboard Theme System
// Inspired by Stripe, Linear, and Vercel

export const theme = {
  // Light Mode Colors
  light: {
    background: {
      primary: '#FAFAFA',      // Main background - soft gray
      secondary: '#FFFFFF',    // Card backgrounds - pure white
      tertiary: '#F5F5F5',     // Sidebar - slightly darker
      elevated: '#FFFFFF',     // Elevated surfaces
    },
    text: {
      primary: '#0F172A',      // Main text - slate 900
      secondary: '#475569',    // Secondary text - slate 600
      tertiary: '#94A3B8',     // Muted text - slate 400
      disabled: '#CBD5E1',     // Disabled text - slate 300
      inverse: '#FFFFFF',      // Text on dark backgrounds
    },
    border: {
      primary: '#E2E8F0',      // Main borders - slate 200
      secondary: '#F1F5F9',    // Subtle borders - slate 100
      focus: '#3B82F6',        // Focus rings - blue 500
    },
    accent: {
      primary: '#3B82F6',      // Blue 500
      primaryHover: '#2563EB', // Blue 600
      primaryActive: '#1D4ED8',// Blue 700
      secondary: '#6366F1',    // Indigo 500
      success: '#10B981',      // Green 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
      info: '#3B82F6',         // Blue 500
    },
    surface: {
      hover: '#F8FAFC',        // Hover state - slate 50
      active: '#F1F5F9',       // Active state - slate 100
      selected: '#EFF6FF',     // Selected state - blue 50
    },
  },

  // Dark Mode Colors - Optimized for readability
  dark: {
    background: {
      primary: '#0A0E1A',      // Main background - deep dark (not pure black)
      secondary: '#151B2E',    // Card backgrounds - slightly lighter
      tertiary: '#070B16',     // Sidebar - darker than main
      elevated: '#1A2235',     // Elevated surfaces
    },
    text: {
      primary: '#F1F5F9',      // Main text - soft white (slate 100)
      secondary: '#CBD5E1',    // Secondary text - slate 300
      tertiary: '#64748B',     // Muted text - slate 500
      disabled: '#475569',     // Disabled text - slate 600
      inverse: '#0F172A',      // Text on light backgrounds
    },
    border: {
      primary: '#1E293B',      // Main borders - slate 800
      secondary: '#0F172A',    // Subtle borders - slate 900
      focus: '#60A5FA',        // Focus rings - blue 400 (brighter)
    },
    accent: {
      primary: '#60A5FA',      // Blue 400 (brighter for dark mode)
      primaryHover: '#3B82F6', // Blue 500
      primaryActive: '#2563EB',// Blue 600
      secondary: '#818CF8',    // Indigo 400
      success: '#34D399',      // Green 400
      warning: '#FBBF24',      // Amber 400
      error: '#F87171',        // Red 400
      info: '#60A5FA',         // Blue 400
    },
    surface: {
      hover: '#1E293B',        // Hover state - slate 800
      active: '#334155',       // Active state - slate 700
      selected: '#1E3A8A',     // Selected state - blue 900
    },
  },

  // Semantic Colors (work in both modes)
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    secondary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },

  // Spacing System
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows - Optimized for both modes
  shadows: {
    light: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    dark: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.7)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['Fira Code', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    theme: '200ms ease-in-out', // For theme switching
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default theme;
