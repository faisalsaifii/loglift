import '@/global.css';

import { Platform } from 'react-native';

/**
 * An indigo / violet palette: soft lavender-tinted surfaces, a vivid indigo
 * accent and a rich deep-purple dark mode. `danger` stays red because
 * destructive actions should read as such on every platform.
 */
export const Colors = {
  light: {
    text: '#1E1B3A',
    background: '#F5F3FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E4DFFB',
    textSecondary: '#5F5B85',
    textTertiary: '#9C98BD',
    surface: '#FFFFFF',
    surfaceSunken: '#ECE8FD',
    surfaceHighlight: '#F7F5FF',
    border: '#E2DDF7',
    borderStrong: '#C9C2EE',
    accent: '#6D4AFF',
    accentSoft: 'rgba(109, 74, 255, 0.10)',
    onAccent: '#FFFFFF',
    danger: '#F43F5E',
    dangerSoft: 'rgba(244, 63, 94, 0.10)',
    shadow: '#4C3BA8',
    overlay: 'rgba(30, 27, 58, 0.45)',
    scrim: 'rgba(245, 243, 255, 0.94)',
  },
  dark: {
    text: '#F1EFFF',
    background: '#0F0D1F',
    backgroundElement: '#1A1733',
    backgroundSelected: '#2A2650',
    textSecondary: '#A9A5CF',
    textTertiary: '#6F6B99',
    surface: '#1A1733',
    surfaceSunken: '#0A0817',
    surfaceHighlight: '#232044',
    border: '#2E2A55',
    borderStrong: '#443F7A',
    accent: '#A78BFA',
    accentSoft: 'rgba(167, 139, 250, 0.16)',
    onAccent: '#14102B',
    danger: '#FB7185',
    dangerSoft: 'rgba(251, 113, 133, 0.16)',
    shadow: '#000000',
    overlay: 'rgba(5, 3, 15, 0.65)',
    scrim: 'rgba(15, 13, 31, 0.94)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Body parts share the theme accent. Keys are retained because they define
 * MuscleGroupId; give entries distinct values here to reintroduce per-muscle hue.
 */
export const MusclePalette = {
  chest: { light: '#6D4AFF', dark: '#A78BFA' },
  back: { light: '#6D4AFF', dark: '#A78BFA' },
  shoulders: { light: '#6D4AFF', dark: '#A78BFA' },
  biceps: { light: '#6D4AFF', dark: '#A78BFA' },
  triceps: { light: '#6D4AFF', dark: '#A78BFA' },
  legs: { light: '#6D4AFF', dark: '#A78BFA' },
  core: { light: '#6D4AFF', dark: '#A78BFA' },
} as const;
/**
 * `sans` is the platform UI face on every target. `display` is the same face —
 * native titles are not rounded, and using SF Rounded for headings was the main
 * thing making this app read as "designed" rather than "native".
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    display: 'system-ui',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    display: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    display: 'var(--font-display)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

/**
 * Tighter radii than the previous token set. Native list content sits at 8–12pt
 * (inset grouped cells); 26pt read as a Material card.
 */
export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
