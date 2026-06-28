/**
 * Centralized Color Palette for Portfolio
 * 
 * This file contains all colors used throughout the application
 * organized by semantic meaning and theme variants.
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Primary Pink Palette
  pink: {
    25: '#FEF8FA',        // Very light pink transition color (rgb(254 248 250))
    50: '#FFF5F7',        // Light pink background
    100: '#FAE8ED',       // Lavender blush
    200: '#FDD5DF',       // Mimi pink
    300: '#EABEC3',       // Main dusty pink
    400: '#D9A5AC',       // Darker dusty pink
    500: '#C88B95',       // Even darker dusty pink
    600: '#B8727C',       // Strong dusty pink
    700: '#A6707B',       // Navigation text
    800: '#8B5A65',       // Main text pink (WCAG AA)
    900: '#6B4C57',       // Darkest pink
  },

  punk: {
    hotPink: '#EC4999',
    lipstick: '#FF1F7D',
    blush: '#FFD6E8',
    ribbon: '#FDD5DF',
  },

  // Dark theme colors
  dark: {
    50: '#F8FAFC',        // Almost white
    100: '#F1F5F9',       // Very light gray
    200: '#E2E8F0',       // Light gray
    300: '#CBD5E1',       // Medium light gray
    400: '#94A3B8',       // Medium gray
    500: '#64748B',       // Neutral gray
    600: '#475569',       // Medium dark gray
    700: '#334155',       // Dark gray
    800: '#1E293B',       // Very dark gray
    900: '#0F172A',       // Almost black
    950: '#020617',       // Darkest
  },

  // Semantic colors
  background: {
    light: {
      primary: '#f5f0e8',
      secondary: '#FFF5F7',
      gradient: 'transparent',
      gradientEnd: 'transparent', // transparent — forest shows through
      overlay: 'rgba(245, 240, 232, 0.66)',
      // Section-specific gradients - mostly white with very light pink brush at edges
      sections: {
        about: 'transparent',
        skills: 'transparent',
        projects: 'transparent',
        experience: 'transparent',
        certifications: 'transparent',
      },
    },
    dark: {
      primary: '#f5f0e8',
      secondary: '#ede9e2',
      gradient: 'transparent',
      gradientEnd: 'transparent', // transparent — forest shows through section transitions
      overlay: 'rgba(245, 240, 232, 0.72)',
      // Dark mode sections: transparent so the forest background shows through
      sections: {
        about: 'transparent',
        skills: 'transparent',
        projects: 'transparent',
        experience: 'transparent',
        certifications: 'transparent',
      },
    },
  },

  // Text colors
  text: {
    light: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000',
      accent: '#8B2E1A',
      pink: '#EC4999',
    },
    dark: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000',
      accent: '#8B2E1A',
      pink: '#EC4999',
    },
  },

  // Interactive elements
  interactive: {
    light: {
      primary: 'rgba(234, 190, 195, 0.1)',
      hover: 'rgba(234, 190, 195, 0.2)',
      active: '#EABEC3',
      focus: 'rgba(234, 190, 195, 0.3)',
    },
    dark: {
      primary: 'rgba(234, 190, 195, 0.1)',
      hover: 'rgba(234, 190, 195, 0.2)',
      active: '#EABEC3',
      focus: 'rgba(234, 190, 195, 0.3)',
    },
  },

  // Navigation specific
  navigation: {
    light: {
      background: 'rgba(245, 240, 232, 0.72)',
      backgroundScrolled: 'rgba(245, 240, 232, 0.88)',
      border: 'rgba(255, 194, 209, 0.15)',
      borderScrolled: 'rgba(255, 194, 209, 0.2)',
      shadow: 'rgba(255, 194, 209, 0.08)',
      shadowScrolled: 'rgba(255, 194, 209, 0.12)',
      mobile: 'rgba(254, 248, 250, 0.95)',
    },
    dark: {
      background: 'rgba(245, 240, 232, 0.72)',
      backgroundScrolled: 'rgba(245, 240, 232, 0.88)',
      border: 'rgba(236, 73, 153, 0.12)',
      borderScrolled: 'rgba(236, 73, 153, 0.18)',
      shadow: 'rgba(42, 31, 20, 0.12)',
      shadowScrolled: 'rgba(42, 31, 20, 0.18)',
      mobile: 'rgba(245, 240, 232, 0.95)',
    },
  },

  // Button variants
  button: {
    primary: {
      light: {
        background: '#EABEC3',
        text: '#000000',
        hover: '#EC4999',
        shadow: 'rgba(236, 73, 153, 0.28)',
      },
      dark: {
        background: '#EABEC3',
        text: '#000000',
        hover: '#EC4999',
        shadow: 'rgba(236, 73, 153, 0.28)',
      },
    },
    secondary: {
      light: {
        background: 'rgba(245, 240, 232, 0.9)',
        text: '#000000',
        border: '#EABEC3',
        hover: '#FAE8ED',
      },
      dark: {
        background: 'rgba(245, 240, 232, 0.9)',
        text: '#000000',
        border: '#EABEC3',
        hover: '#FAE8ED',
      },
    },
    outline: {
      light: {
        background: 'transparent',
        text: '#C88B95',
        border: '#EABEC3',
        hover: '#FAE8ED',
      },
      dark: {
        background: 'transparent',
        text: '#8B2E1A',
        border: '#EABEC3',
        hover: '#FAE8ED',
      },
    },
  },

  // Card colors
  card: {
    light: {
      background: '#f5f0e8',
      border: 'rgba(234, 190, 195, 0.3)',
      shadow: 'rgba(42, 31, 20, 0.12)',
    },
    dark: {
      background: '#f5f0e8',
      border: 'rgba(234, 190, 195, 0.35)',
      shadow: 'rgba(42, 31, 20, 0.18)',
    },
  },

  // Special effects
  effects: {
    glow: 'rgba(255, 194, 209, 0.3)',
    dropShadow: 'rgba(234, 190, 195, 0.3)',
    textShadow: 'rgba(0, 0, 0, 0.1)',
    blur: 'rgba(255, 255, 255, 0.1)',
  },

  // Utility colors
  utility: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#6B7280',
  },

  // Cartographic expedition tokens
  expedition: {
    paper: '#f5f0e8',
    paperWarm: '#ede9e2',
    ink: '#2a1f14',
    inkLight: '#6b5744',
    inkFaint: '#a08878',
    pencil: '#8a8070',
    stampRed: '#8b2e1a',
    stampGreen: '#3a5c3a',
    mapBlue: '#2d5986',
    coverBorderEnd: '#b8845a',
  },

  typography: {
    fonts: {
      display: '"Playfair Display", Georgia, serif',
      body: '"Lora", Georgia, serif',
      mono: '"Courier Prime", "Courier New", monospace',
    },
  },

  // Special colors
  special: {
    dragMe: '#EC4999',       // Hot pink for drag me star (rgb(236, 73, 153))
    aurora: {
      dark: '#FF94B4',       // Pink aurora for dark mode
      light: {
        1: '#FBCFE8',        // Light pink aurora stop 1
        2: '#FECDD3',        // Light pink aurora stop 2
        3: '#FED7E2',        // Light pink aurora stop 3
      }
    }
  },
} as const;

// Type definitions for better TypeScript support
type ColorTheme = 'light' | 'dark';
type ColorVariant = keyof typeof colors;

export type { ColorTheme, ColorVariant };

// Helper function to get theme-specific colors
export const getThemeColors = (theme: ColorTheme) => ({
  background: colors.background[theme],
  text: colors.text[theme],
  interactive: colors.interactive[theme],
  navigation: colors.navigation[theme],
  button: {
    primary: colors.button.primary[theme],
    secondary: colors.button.secondary[theme],
    outline: colors.button.outline[theme],
  },
  card: colors.card[theme],
});