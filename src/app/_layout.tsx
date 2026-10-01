import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useHeaderScreenOptions } from '@/components/nav';
import { LibraryProvider } from '@/store/library';

function ThemedStack() {
  const scheme = useColorScheme();
  const screenOptions = useHeaderScreenOptions();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          ...screenOptions,
          // Chevron-only back button. `headerBackTitle` is kept per-screen purely
          // to feed the accessibility label — without it the label falls back to
          // the previous route's name.
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="muscle/[muscle]"
          options={{ title: '', headerBackTitle: 'Muscles' }}
        />
        <Stack.Screen
          name="collection/[collection]"
          options={{ title: '', headerBackTitle: 'Muscles' }}
        />
        <Stack.Screen name="exercise/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen name="search" options={{ title: '', headerBackTitle: 'Muscles' }} />
        <Stack.Screen name="log-pr" options={{ presentation: 'modal', title: 'Log a set' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <LibraryProvider>
            <ThemedStack />
          </LibraryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
