import { Stack, type NativeStackNavigationOptions } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/**
 * Header styling shared by every native stack in the app, so tab stacks and the
 * root stack render identical bars.
 */
export function useHeaderScreenOptions(): NativeStackNavigationOptions {
  const colors = useTheme();

  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}

/**
 * A tab's own native header. `NativeTabs` has no header option of its own — the
 * SDK docs state each tab must nest a native `<Stack />` "to support both headers
 * and pushing screens", so every tab screen gets a real navigation bar here.
 */
export function TabStack() {
  const screenOptions = useHeaderScreenOptions();

  return <Stack screenOptions={screenOptions} />;
}
