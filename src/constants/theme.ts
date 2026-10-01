import '@/global.css';

import { Platform } from 'react-native';

/**
 * A deliberately neutral, grayscale palette. Values are lifted from the iOS
 * system greys (`label`, `secondaryLabel`, `separator`, `systemGroupedBackground`)
 * so the app sits next to native surfaces instead of fighting them. The only
 * chromatic colour left is `danger`, because destructive actions stay red on
 * every native platform.
 */
export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E9E9EA',
    textSecondary: '#6C6C70',
    textTertiary: '#A1A1A6',
    surface: '#FFFFFF',
    surfaceSunken: '#F2F2F7',
    surfaceHighlight: '#F9F9F9',
    border: '#E5E5EA',
    borderStrong: '#C6C6CB',
    /** Native tint colour: pure black in light mode, pure white in dark. */
    accent: '#000000',
    accentSoft: 'rgba(0, 0, 0, 0.05)',
    onAccent: '#FFFFFF',
    danger: '#FF3B30',
    dangerSoft: 'rgba(255, 59, 48, 0.10)',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.4)',
    scrim: 'rgba(255, 255, 255, 0.94)',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#1C1C1E',
    backgroundSelected: '#2C2C2E',
    textSecondary: '#98989F',
    textTertiary: '#6B6B72',
    surface: '#1C1C1E',
    surfaceSunken: '#0A0A0B',
    surfaceHighlight: '#2C2C2E',
    border: '#38383A',
    borderStrong: '#48484A',
    accent: '#FFFFFF',
    accentSoft: 'rgba(255, 255, 255, 0.10)',
    onAccent: '#000000',
    danger: '#FF453A',
    dangerSoft: 'rgba(255, 69, 58, 0.15)',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    scrim: 'rgba(0, 0, 0, 0.94)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Body parts no longer carry hue — the UI is grayscale. The keys are retained
 * because they define `MuscleGroupId` and therefore the catalogue's shape, but
 * every entry resolves to the same neutral so no screen can reintroduce colour
 * by accident.
 */
export const MusclePalette = {
  chest: { light: '#000000', dark: '#FFFFFF' },
  back: { light: '#000000', dark: '#FFFFFF' },
  shoulders: { light: '#000000', dark: '#FFFFFF' },
  biceps: { light: '#000000', dark: '#FFFFFF' },
  triceps: { light: '#000000', dark: '#FFFFFF' },
  legs: { light: '#000000', dark: '#FFFFFF' },
  core: { light: '#000000', dark: '#FFFFFF' },
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
