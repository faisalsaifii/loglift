import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'mono';

type Tone = 'primary' | 'secondary' | 'accent' | 'danger' | 'inverse';

type TxtProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
  /** Renders in all caps with wide tracking — used for section eyebrows. */
  eyebrow?: boolean;
};

const VARIANTS = StyleSheet.create({
  display: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: Fonts.sans,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
}) as unknown as Record<Variant | 'eyebrow', TextStyle>;

export function Txt({ variant = 'body', tone = 'primary', eyebrow, style, ...rest }: TxtProps) {
  const colors = useTheme();

  const toneColor =
    tone === 'secondary'
      ? colors.textSecondary
      : tone === 'accent'
        ? colors.accent
        : tone === 'danger'
          ? colors.danger
          : tone === 'inverse'
            ? colors.backgroundElement
            : colors.text;

  return (
    <Text
      {...rest}
      style={[VARIANTS[variant], { color: toneColor }, eyebrow && VARIANTS.eyebrow, style]}
    />
  );
}
