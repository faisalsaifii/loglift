import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChartPoint = { time: number; value: number };

type LineChartProps = {
  points: ChartPoint[];
  /** Inclusive time window the x axis spans, epoch milliseconds. */
  start: number;
  end: number;
  formatValue: (value: number) => string;
  formatTime: (time: number) => string;
  height?: number;
};

const PAD = { top: 12, bottom: 28, left: 8, right: 44 };
const X_TICKS = 4;
const Y_TICKS = 3;

/** Smooth path through the points using horizontal-tangent cubic segments. */
function smoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) {
    return '';
  }
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const next = coords[i];
    const mid = (prev.x + next.x) / 2;
    d += ` C ${mid} ${prev.y} ${mid} ${next.y} ${next.x} ${next.y}`;
  }
  return d;
}

export function LineChart({
  points,
  start,
  end,
  formatValue,
  formatTime,
  height = 220,
}: LineChartProps) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const geometry = useMemo(() => {
    if (width === 0 || points.length === 0) {
      return undefined;
    }
    const values = points.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max - min < 0.5) {
      min -= 0.5;
      max += 0.5;
    }
    const pad = (max - min) * 0.15;
    min -= pad;
    max += pad;

    const plotW = width - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const span = Math.max(end - start, 1);
    const x = (time: number) => PAD.left + ((time - start) / span) * plotW;
    const y = (value: number) => PAD.top + (1 - (value - min) / (max - min)) * plotH;

    const coords = points.map((p) => ({ x: x(p.time), y: y(p.value) }));
    const baseline = PAD.top + plotH;
    const line = smoothPath(coords);
    const area =
      coords.length > 1
        ? `${line} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
        : '';

    const yTicks = Array.from({ length: Y_TICKS }, (_, i) => {
      const value = min + ((max - min) * i) / (Y_TICKS - 1);
      return { y: y(value), label: formatValue(value) };
    });
    const xTicks = Array.from({ length: X_TICKS }, (_, i) => {
      const time = start + (span * i) / (X_TICKS - 1);
      return { x: x(time), label: formatTime(time), index: i };
    });

    return { coords, line, area, yTicks, xTicks, plotRight: width - PAD.right };
  }, [width, points, start, end, height, formatValue, formatTime]);

  return (
    <View style={[styles.root, { height }]} onLayout={onLayout}>
      {geometry ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {geometry.yTicks.map((tick) => (
            <Line
              key={`g-${tick.y}`}
              x1={PAD.left}
              x2={geometry.plotRight}
              y1={tick.y}
              y2={tick.y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          {geometry.yTicks.map((tick) => (
            <SvgText
              key={`y-${tick.y}`}
              x={width - PAD.right + 8}
              y={tick.y + 4}
              fontSize={11}
              fill={colors.textSecondary}>
              {tick.label}
            </SvgText>
          ))}
          {geometry.xTicks.map((tick) => (
            <SvgText
              key={`x-${tick.index}`}
              x={tick.x}
              y={height - 8}
              fontSize={11}
              fill={colors.textSecondary}
              textAnchor={tick.index === 0 ? 'start' : tick.index === X_TICKS - 1 ? 'end' : 'middle'}>
              {tick.label}
            </SvgText>
          ))}

          {geometry.area ? <Path d={geometry.area} fill="url(#fill)" /> : null}
          {geometry.coords.length > 1 ? (
            <Path
              d={geometry.line}
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {geometry.coords.length <= 60
            ? geometry.coords.map((c, i) => (
                <Circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={4}
                  fill={colors.accent}
                  stroke={colors.surface}
                  strokeWidth={2}
                />
              ))
            : null}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginTop: Spacing.two,
  },
});
