import { Stack } from "expo-router";
import {
  Alert,
  Button,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { Txt } from "@/components/txt";
import { Card } from "@/components/ui";
import { UnitSelector } from "@/components/unit-selector";
import { Spacing } from "@/constants/theme";
import {
  CATALOG_ATTRIBUTION,
  CATALOG_LICENSE,
  CATALOG_VERSION,
} from "@/data/exercises";
import { useTheme } from "@/hooks/use-theme";
import { useLibrary } from "@/store/library";
import { pluralize, UNIT_NAMES } from "@/utils/weight";

export default function SettingsScreen() {
  const colors = useTheme();
  const { unit, setUnit, clearAll, stats } = useLibrary();

  const confirmClear = () => {
    const message =
      "This removes every exercise from your library and all logged sets. It cannot be undone.";
    if (Platform.OS === "web") {
      clearAll();
      return;
    }
    Alert.alert("Clear all data?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear everything", style: "destructive", onPress: clearAll },
    ]);
  };

  return (
    <Screen>
      <Stack.Title>Settings</Stack.Title>

      <Card>
        <Txt variant="heading">Weight unit</Txt>
        <Txt variant="body" tone="secondary">
          Sets are stored in kilograms, so switching here only changes how they
          are displayed.
        </Txt>
        <UnitSelector
          value={unit}
          onChange={setUnit}
          labels={UNIT_NAMES}
          style={styles.unitSelector}
          testID="settings-weight-unit"
        />
      </Card>

      <Card>
        <Txt variant="heading">Your data</Txt>
        <Txt variant="body" tone="secondary">
          {pluralize(stats.totalExercises, "exercise")} tracked ·{" "}
          {pluralize(stats.totalPrs, "set")} logged
        </Txt>
        <View style={styles.dangerRow}>
          <Button
            title="Clear all data"
            color={colors.danger}
            onPress={confirmClear}
          />
        </View>
      </Card>

      <Card>
        <Txt variant="heading">About</Txt>
        <Txt variant="body" tone="secondary">
          {CATALOG_ATTRIBUTION}
        </Txt>
        <Txt variant="caption" tone="secondary">
          Catalogue version {CATALOG_VERSION}
        </Txt>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            Linking.openURL(CATALOG_LICENSE).catch(() => {});
          }}
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        >
          <Icon name="link" size={16} color={colors.accent} />
          <Txt variant="label" tone="accent" style={styles.dangerText}>
            Source dataset &amp; licence
          </Txt>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  unitSelector: {
    marginTop: Spacing.three,
  },
  dangerRow: {
    marginTop: Spacing.three,
  },
  dangerText: {
    flex: 1,
  },
  groups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
