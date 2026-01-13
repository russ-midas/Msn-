/**
 * Retro Messenger Color Palette
 * Inspired by MSN Messenger, AIM, and ICQ
 */

export const colors = {
  // MSN Messenger inspired greens
  msn: {
    primary: '#1E5128',
    secondary: '#4E9F3D',
    light: '#8FD14F',
    accent: '#D8E9A8',
  },

  // AIM inspired yellows/oranges
  aim: {
    primary: '#FFD700',
    secondary: '#FFA500',
    running: '#FF6B00',
    buddy: '#FFEB3B',
  },

  // ICQ inspired
  icq: {
    green: '#7CB342',
    flower: '#8BC34A',
    red: '#F44336',
  },

  // Status colors
  status: {
    online: '#4CAF50',
    away: '#FFC107',
    busy: '#F44336',
    invisible: '#9E9E9E',
    offline: '#757575',
  },

  // UI colors
  ui: {
    background: '#1A1A2E',
    surface: '#16213E',
    surfaceLight: '#1F3460',
    card: '#0F3460',
    border: '#2A4A7F',
    divider: '#2A3F5F',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B8C5D6',
    muted: '#7F8C9A',
    inverse: '#1A1A2E',
  },

  // Message bubbles
  message: {
    sent: '#1E5128',
    sentText: '#FFFFFF',
    received: '#2A3F5F',
    receivedText: '#FFFFFF',
    system: '#3D3D5C',
    systemText: '#B8C5D6',
  },

  // Classic window chrome
  chrome: {
    titleBar: '#0A1929',
    titleBarText: '#FFFFFF',
    windowBorder: '#2A4A7F',
    buttonClose: '#F44336',
    buttonMinimize: '#FFC107',
    buttonMaximize: '#4CAF50',
  },

  // Gradients (as arrays for LinearGradient)
  gradients: {
    msnHeader: ['#1E5128', '#4E9F3D'],
    aimHeader: ['#FFD700', '#FFA500'],
    icqHeader: ['#7CB342', '#8BC34A'],
    darkSurface: ['#1A1A2E', '#16213E'],
    online: ['#4CAF50', '#45A049'],
    away: ['#FFC107', '#FFB300'],
    busy: ['#F44336', '#E53935'],
  },
};

export type ColorTheme = typeof colors;
