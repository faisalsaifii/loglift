import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  /** Controls rendered at the top of the body: above the content, inside the scroll view. */
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

  /*
   * Controls belong *inside* the scroll view, not as a sibling above it. On
   * iOS 26 the navigation bar is a floating glass overlay, and react-native-screens
   * only keeps content clear of it by wrapping screen children in a `SafeAreaView`
   * whose top inset is a single snapshot taken when the screen attaches — the bar
   * is still resizing at that point when a `Stack.Toolbar` pulls the search field
   * down into it. A `View` parked outside the scroll view gets no inset at all, so
   * it was the one thing that vanished underneath the bar. Inside the scroll view
   * UIKit's automatic adjustment always applies the bar's live insets, which is
   * also what Expo's `Stack.Toolbar`/`Stack.SearchBar` docs require.
   */
  const controls = header ? (
    <View style={[styles.header, { backgroundColor: colors.background }]}>{header}</View>
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}>
          {controls}
          {body}
        </ScrollView>
      ) : (
        <>
          {/*
            No scroll view to inset, so a non-scrolling body has to handle its own
            safe area — pass `contentInsetAdjustmentBehavior="automatic"` to whatever
            list it renders.
          */}
          {controls}
          {body}
        </>
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
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
