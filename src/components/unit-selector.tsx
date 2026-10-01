import { SegmentedControl } from '@expo/ui/community/segmented-control';
import type { StyleProp, ViewStyle } from 'react-native';

import { UNIT_LABELS, WEIGHT_UNITS, type WeightUnit } from '@/utils/weight';

type UnitSelectorProps = {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
  /** Segment text. Defaults to the short `kg` / `lb` suffixes. */
  labels?: Record<WeightUnit, string>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The native segmented control for the display unit: SwiftUI `UISegmentedControl`
 * on iOS, Material 3 `SingleChoiceSegmentedButtonRow` on Android, and a web
 * fallback. Both units stay visible, so switching costs one tap.
 */
export function UnitSelector({
  value,
  onChange,
  labels = UNIT_LABELS,
  style,
  testID,
}: UnitSelectorProps) {
  return (
    <SegmentedControl
      values={WEIGHT_UNITS.map((unit) => labels[unit])}
      selectedIndex={WEIGHT_UNITS.indexOf(value)}
      onChange={(event) => {
        const next = WEIGHT_UNITS[event.nativeEvent.selectedSegmentIndex];
        if (next) {
          onChange(next);
        }
      }}
      style={style}
      testID={testID}
    />
  );
}