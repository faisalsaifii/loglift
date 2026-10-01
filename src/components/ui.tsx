import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * A grouped-background container: flat fill, hairline border, no shadow and no
 * accent bar. This mirrors an inset grouped `UITableView` / Material surface
 * rather than a floating Material card.
 */
export function Card({ children, style, padded = true, onPress, accessibilityLabel }: CardProps) {
  const colors = useTheme();

  const base = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    padded && styles.padded,
  ];

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  accentColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  accentColor,
  disabled,
  style,
}: ButtonProps) {
  const colors = useTheme();
  const tint = accentColor ?? colors.accent;

  const background =
    variant === 'primary'
      ? tint
      : variant === 'danger'
        ? colors.dangerSoft
        : variant === 'secondary'
          ? colors.surfaceSunken
          : 'transparent';

  const foreground =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.danger
        : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'ghost' ? colors.border : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
        style,
      ]}>
      {icon ? <Icon name={icon} size={18} color={foreground} weight="semibold" /> : null}
      <Txt variant="subheading" style={{ color: foreground }}>
        {label}
      </Txt>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  color?: string;
  /** Renders as a solid pill tinted with `color` instead of an outlined one. */
  filled?: boolean;
  icon?: IconName;
};

export function Chip({ label, color, filled, icon }: ChipProps) {
  const colors = useTheme();
  const tint = color ?? colors.accent;

  return (
    <View
      style={[
        styles.chip,
        filled
          ? { backgroundColor: tint, borderColor: tint }
          : { backgroundColor: 'transparent', borderColor: colors.border },
      ]}>
      {icon ? (
        <Icon name={icon} size={12} color={filled ? colors.onAccent : colors.textSecondary} />
      ) : null}
      <Txt
        variant="caption"
        style={{ color: filled ? colors.onAccent : colors.textSecondary, fontWeight: '600' }}>
        {label}
      </Txt>
    </View>
  );
}

type IconButtonProps = {
  name: IconName;
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel: string;
};

export function IconButton({
  name,
  onPress,
  color,
  size = 20,
  accessibilityLabel,
}: IconButtonProps) {
  const colors = useTheme();
  const tint = color ?? colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1 }]}>
      <Icon name={name} size={size} color={tint} />
    </Pressable>
  );
}

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const colors = useTheme();

  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { borderColor: colors.border }]}>
        <Icon name={icon} size={26} color={colors.textSecondary} />
      </View>
      <Txt variant="heading" style={styles.emptyTitle}>
        {title}
      </Txt>
      <Txt tone="secondary" style={styles.emptyMessage}>
        {message}
      </Txt>
      {action ? (
        <Button label={action.label} onPress={action.onPress} style={styles.emptyAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.four,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 50,
    paddingHorizontal: Spacing.five,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: Spacing.two,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyAction: {
    marginTop: Spacing.two,
  },
});
