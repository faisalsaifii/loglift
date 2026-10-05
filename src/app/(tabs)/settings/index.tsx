import { Stack } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { Txt } from "@/components/txt";
import { Button, Card } from "@/components/ui";
import { UnitSelector } from "@/components/unit-selector";
import { Spacing } from "@/constants/theme";
import {
  CATALOG_ATTRIBUTION,
  CATALOG_LICENSE,
  CATALOG_VERSION,
} from "@/data/exercises";
import { useTheme } from "@/hooks/use-theme";
import { useLibrary } from "@/store/library";
import { exportLibrary, importLibrary } from "@/utils/transfer";
import { pluralize, UNIT_NAMES } from "@/utils/weight";

const COPY_TO_CLIPBOARD =
  "Backup copied to your clipboard. Paste it somewhere safe, then use Import data on the other device.";

const NOTHING_TO_EXPORT =
  "There is nothing to export yet — add an exercise to your library first.";

const EXPORT_FAILED =
  "Log Lift could not export your data. Check that the device has free space, then try again.";

const IMPORT_FAILED =
  "That file could not be read as a Log Lift backup. Export a fresh one from the device the data is on, then import that.";

type TransferStatus = { tone: "success" | "danger"; message: string } | undefined;

export default function SettingsScreen() {
  const colors = useTheme();
  const { unit, setUnit, clearAll, stats, isReady, getSnapshot, replaceAll } =
    useLibrary();
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState<TransferStatus>(undefined);

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

  const handleExport = async () => {
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    setStatus(undefined);
    try {
      const result = await exportLibrary(getSnapshot());
      if (result.status === "shared") {
        setStatus({ tone: "success", message: "Backup ready." });
      } else if (result.status === "copied") {
        setStatus({ tone: "success", message: COPY_TO_CLIPBOARD });
      } else if (result.status === "nothingToExport") {
        setStatus({ tone: "danger", message: NOTHING_TO_EXPORT });
      } else {
        setStatus({ tone: "danger", message: EXPORT_FAILED });
      }
    } catch (error) {
      console.warn("Export failed", error);
      setStatus({ tone: "danger", message: EXPORT_FAILED });
    } finally {
      setIsBusy(false);
    }
  };

  const applyImport = async () => {
    setStatus(undefined);
    try {
      const result = await importLibrary();
      if (result.status === "imported") {
        replaceAll(result.snapshot);
        setStatus({
          tone: "success",
          message: `${pluralize(
            Object.keys(result.snapshot.logs).length,
            "exercise",
          )} tracked · ${pluralize(
            Object.values(result.snapshot.logs).reduce(
              (total, log) => total + log.prs.length,
              0,
            ),
            "set",
          )} logged`,
        });
      } else if (result.status === "failed") {
        setStatus({ tone: "danger", message: IMPORT_FAILED });
      }
    } catch (error) {
      console.warn("Import failed", error);
      setStatus({ tone: "danger", message: IMPORT_FAILED });
    }
  };

  const confirmImport = () => {
    const message = stats.totalExercises
      ? `This replaces the ${pluralize(
          stats.totalExercises,
          "exercise",
        )} and ${pluralize(
          stats.totalPrs,
          "set",
        )} currently on this device. It cannot be undone.`
      : "This replaces everything on this device with the contents of the backup.";

    // The web build has no button-bearing Alert, so there is nothing to
    // confirm against — the copy above spells out what happens either way.
    if (Platform.OS === "web") {
      void applyImport();
      return;
    }

    Alert.alert("Import data?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Choose backup file", onPress: () => void applyImport() },
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
        <Txt variant="heading">Transfer data</Txt>
        <Txt variant="body" tone="secondary">
          Save a backup to move your library and logged sets to another device.
          Importing replaces whatever is on this device.
        </Txt>
        <View style={styles.transferRow}>
          <Button
            label="Export data"
            icon="upload"
            variant="primary"
            onPress={() => void handleExport()}
            disabled={!isReady || isBusy}
            accessibilityHint="Exports your library and logged sets"
            style={styles.transferButton}
          />
          <Button
            label="Import data"
            icon="download"
            variant="secondary"
            onPress={confirmImport}
            disabled={!isReady || isBusy}
            accessibilityHint="Replaces your library with a backup file you choose"
            style={styles.transferButton}
          />
        </View>
        {status ? (
          <Txt
            variant="caption"
            tone={status.tone === "danger" ? "danger" : "secondary"}
            style={styles.status}
          >
            {status.message}
          </Txt>
        ) : null}
      </Card>

      <Card>
        <Txt variant="heading">Your data</Txt>
        <Txt variant="body" tone="secondary">
          {pluralize(stats.totalExercises, "exercise")} tracked ·{" "}
          {pluralize(stats.totalPrs, "set")} logged
        </Txt>
        <View style={styles.dangerRow}>
          <Button
            label="Clear all data"
            icon="trash"
            variant="danger"
            onPress={confirmClear}
            accessibilityHint="Removes every exercise and all logged sets"
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
  transferRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  transferButton: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  status: {
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
