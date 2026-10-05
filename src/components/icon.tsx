import MaterialDesignIcons, {
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform, type ImageStyle, type StyleProp } from 'react-native';

/**
 * Every icon in the app is declared once here with its iOS SF Symbol and its
 * Android/web Material Design glyph, so a rename in either font is a type error
 * rather than a blank square at runtime.
 */
export const ICONS = {
  muscles: { sf: 'dumbbell.fill', md: 'weight-lifter' },
  progress: { sf: 'chart.line.uptrend.xyaxis', md: 'trending-up' },
  settings: { sf: 'gearshape', md: 'cog' },

  chest: { sf: 'heart.fill', md: 'heart' },
  back: { sf: 'figure.rower', md: 'rowing' },
  shoulders: { sf: 'figure.strengthtraining.traditional', md: 'human-male' },
  biceps: { sf: 'bolt.fill', md: 'arm-flex' },
  triceps: { sf: 'figure.strengthtraining.functional', md: 'gymnastics' },
  legs: { sf: 'figure.run', md: 'run' },
  core: { sf: 'figure.core.training', md: 'yoga' },
  /** Not a muscle group: the catch-all row that lists the whole catalogue. */
  fullBody: { sf: 'figure.mind.and.body', md: 'human' },
  push: { sf: 'arrow.up.right', md: 'arrow-top-right' },
  pull: { sf: 'arrow.down.left', md: 'arrow-bottom-left' },

  search: { sf: 'magnifyingglass', md: 'magnify' },
  clear: { sf: 'xmark.circle.fill', md: 'close-circle' },
  play: { sf: 'play.fill', md: 'play' },
  pause: { sf: 'pause.fill', md: 'pause' },
  add: { sf: 'plus.circle.fill', md: 'plus-circle' },
  check: { sf: 'checkmark', md: 'check' },
  plus: { sf: 'plus', md: 'plus' },
  chevron: { sf: 'chevron.right', md: 'chevron-right' },
  trash: { sf: 'trash', md: 'delete' },
  trophy: { sf: 'trophy.fill', md: 'trophy' },
  history: { sf: 'clock.arrow.circlepath', md: 'history' },
  swap: { sf: 'arrow.triangle.2.circlepath', md: 'restore' },
  info: { sf: 'info.circle', md: 'information' },
  scale: { sf: 'scalemass', md: 'scale-balance' },
  flame: { sf: 'flame.fill', md: 'fire' },
  reset: { sf: 'exclamationmark.triangle.fill', md: 'alert' },
  library: { sf: 'square.stack.3d.up.fill', md: 'format-list-bulleted' },
  grid: { sf: 'square.grid.2x2', md: 'view-grid' },
  sparkle: { sf: 'sparkles', md: 'auto-fix' },
  link: { sf: 'square.and.arrow.up', md: 'open-in-new' },
  target: { sf: 'scope', md: 'target' },
  upload: { sf: 'square.and.arrow.up', md: 'upload' },
  download: { sf: 'square.and.arrow.down', md: 'download' },
} as const satisfies Record<string, { sf: SFSymbol; md: MaterialDesignIconsIconName }>;

export type IconName = keyof typeof ICONS;

/**
 * Whether the binary actually provides the SF Symbols view.
 *
 * `expo-symbols` cannot degrade on its own: `requireNativeViewManager` always
 * returns a component, so its `fallback` prop is unreachable when the native
 * module is missing, and Fabric throws
 * "View config getter callback for component ViewManagerAdapter_SymbolModule
 * must be a function" instead. Probing once lets us drop to the Material glyph
 * — the iOS font is registered by the vector-icons config plugin — so a stale
 * binary costs icon fidelity rather than the whole screen.
 */
const hasSymbolView = requireOptionalNativeModule('SymbolModule') != null;

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /** `fill` renders the SF Symbol variant with a solid fill where one exists. */
  weight?: 'regular' | 'semibold' | 'bold';
  style?: StyleProp<ImageStyle>;
};

export function Icon({ name, size = 20, color, weight = 'regular', style }: IconProps) {
  const glyph = ICONS[name];

  if (Platform.OS === 'ios' && hasSymbolView) {
    return (
      <SymbolView
        name={glyph.sf}
        tintColor={color}
        size={size}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }

  return <MaterialDesignIcons name={glyph.md} size={size} color={color} style={style} />;
}
