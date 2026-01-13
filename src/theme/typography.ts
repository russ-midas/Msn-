import { TextStyle } from 'react-native';

/**
 * Typography styles inspired by classic messenger apps
 */

export const typography = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.25,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontWeight: '600',
  } as TextStyle,

  h4: {
    fontSize: 18,
    fontWeight: '500',
  } as TextStyle,

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  // UI elements
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.25,
  } as TextStyle,

  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
  } as TextStyle,

  // Special styles
  screenName: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  statusMessage: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
  } as TextStyle,

  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  } as TextStyle,

  chatMessage: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  // Classic retro style
  retro: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,
};

export type Typography = typeof typography;
