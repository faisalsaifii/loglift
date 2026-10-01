import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  /** Sticky content rendered above the scrolling body, below the native header. */
  header?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Scrolling body for a screen. Titles live in the native navigation bar via
 * `<Stack.Title>` / `<Stack.Screen options={{ title }}>`, so this deliberately
 * renders no heading of its own.
 */
export function Screen({ children, header, scroll = true, contentStyle }: ScreenProps) {
  const colors = useTheme();

  const body = <View style={[styles.inner, contentStyle]}>{children}</View>;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {header ? (
        <View style={[styles.header, { backgroundColor: colors.background }]}>{header}</View>
      ) : null}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.seven,
  },
  header: {
    paddingTop: Spacing.three,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingTop: Spacing.three,
  },
});
