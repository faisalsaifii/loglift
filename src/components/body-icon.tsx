import type { ReactElement } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * Anatomical glyphs for the muscle list: a faint body silhouette with the
 * targeted muscle filled in. Neither SF Symbols nor Material Design ships
 * muscle-specific icons, so these are drawn on a 24×24 grid.
 */
export type BodyIconName =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'fullBody'
  | 'push'
  | 'pull';

type Part =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core';

const SPEC: Record<BodyIconName, { view: 'front' | 'back'; parts: Part[] }> = {
  chest: { view: 'front', parts: ['chest'] },
  back: { view: 'back', parts: ['back'] },
  shoulders: { view: 'front', parts: ['shoulders'] },
  biceps: { view: 'front', parts: ['biceps'] },
  triceps: { view: 'back', parts: ['triceps'] },
  legs: { view: 'front', parts: ['legs'] },
  core: { view: 'front', parts: ['core'] },
  fullBody: {
    view: 'front',
    parts: ['chest', 'shoulders', 'biceps', 'core', 'legs'],
  },
  push: { view: 'front', parts: ['chest', 'shoulders'] },
  pull: { view: 'back', parts: ['back', 'biceps'] },
};

export function isBodyIcon(name: string): name is BodyIconName {
  return name in SPEC;
}

const HIGHLIGHT: Record<Part, (fill: string) => ReactElement[]> = {
  chest: (f) => [
    <Rect key="c" x={8.2} y={6.9} width={7.6} height={3.6} rx={1.6} fill={f} />,
  ],
  back: (f) => [
    <Path
      key="b"
      d="M8.2 6.6 H15.8 L14.6 13.4 Q12 14.4 9.4 13.4 Z"
      fill={f}
    />,
  ],
  shoulders: (f) => [
    <Circle key="l" cx={6.2} cy={7.7} r={2.1} fill={f} />,
    <Circle key="r" cx={17.8} cy={7.7} r={2.1} fill={f} />,
  ],
  biceps: (f) => [
    <Rect key="l" x={4.7} y={9.2} width={3} height={4.2} rx={1.5} fill={f} />,
    <Rect key="r" x={16.3} y={9.2} width={3} height={4.2} rx={1.5} fill={f} />,
  ],
  triceps: (f) => [
    <Rect key="l" x={4.7} y={7} width={3} height={6.4} rx={1.5} fill={f} />,
    <Rect key="r" x={16.3} y={7} width={3} height={6.4} rx={1.5} fill={f} />,
  ],
  legs: (f) => [
    <Rect key="l" x={8.2} y={14.8} width={3.4} height={8.4} rx={1.7} fill={f} />,
    <Rect key="r" x={12.4} y={14.8} width={3.4} height={8.4} rx={1.7} fill={f} />,
  ],
  core: (f) => [
    <Rect key="c" x={9.4} y={10.9} width={5.2} height={3.5} rx={1.2} fill={f} />,
  ],
};

type BodyIconProps = {
  name: BodyIconName;
  size: number;
  color: string;
};

export function BodyIcon({ name, size, color }: BodyIconProps) {
  const { view, parts } = SPEC[name];
  const base = 0.3;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Silhouette */}
      <Circle cx={12} cy={3.1} r={2.2} fill={color} opacity={base} />
      <Rect x={8} y={6} width={8} height={8.6} rx={2.2} fill={color} opacity={base} />
      <Rect x={4.6} y={6.4} width={3.2} height={5} rx={1.6} fill={color} opacity={base} />
      <Rect x={16.2} y={6.4} width={3.2} height={5} rx={1.6} fill={color} opacity={base} />
      <Rect x={4.8} y={11.8} width={2.8} height={4.6} rx={1.4} fill={color} opacity={base} />
      <Rect x={16.4} y={11.8} width={2.8} height={4.6} rx={1.4} fill={color} opacity={base} />
      <Rect x={8.2} y={14.8} width={3.4} height={8.4} rx={1.7} fill={color} opacity={base} />
      <Rect x={12.4} y={14.8} width={3.4} height={8.4} rx={1.7} fill={color} opacity={base} />
      {/* Spine line marks the rear view */}
      {view === 'back' ? (
        <Path d="M12 6.4 V14" stroke={color} strokeWidth={0.6} opacity={0.5} />
      ) : null}
      {/* Target muscle */}
      {parts.map((part) => (
        <G key={part}>{HIGHLIGHT[part](color)}</G>
      ))}
    </Svg>
  );
}
