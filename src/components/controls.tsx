import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Right-hand control, e.g. a unit toggle. */
  accessory?: React.ReactNode;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search exercises',
  accessory,
  autoFocus,
  style,
}: SearchFieldProps) {
  const colors = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.searchRow,
        {
          backgroundColor: colors.surfaceSunken,
          borderColor: focused ? colors.borderStrong : colors.border,
        },
        style,
      ]}>
      <Icon name="search" size={18} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { color: colors.text }]}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clear, { opacity: pressed ? 0.5 : 1 }]}>
          <Icon name="clear" size={17} color={colors.textSecondary} />
        </Pressable>
      ) : null}
      {accessory}
    </View>
  );
}

type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedProps<T>) {
  const colors = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.segmented,
        { backgroundColor: colors.surfaceSunken, borderColor: colors.border },
        style,
      ]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
          style={[
            styles.segment,
            active && {
              backgroundColor: colors.surface,
              borderColor: colors.borderStrong,
            },
          ]}>
            <Txt
              variant="label"
              style={{ color: active ? colors.text : colors.textSecondary }}>
              {option.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function Row({ title, subtitle, left, right, onPress, style, titleStyle }: RowProps) {
  const colors = useTheme();
  const content = (
    <>
      {left}
      <View style={styles.rowText}>
        <Txt variant="subheading" numberOfLines={2} style={titleStyle}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, style]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        styles.rowPressable,
        { opacity: pressed ? 0.6 : 1 },
        style,
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? Spacing.three : Spacing.two,
  },
  clear: {
    padding: Spacing.one,
  },
  segmented: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  rowPressable: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
