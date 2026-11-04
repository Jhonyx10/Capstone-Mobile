import type { ReactNode } from 'react';
import Svg, {
  Path,
  Circle,
  Polyline,
  Polygon,
  Line,
  Rect,
} from 'react-native-svg';
import { useColorScheme } from 'nativewind';

/**
 * Small icon set drawn with react-native-svg (already installed, so no extra
 * package or native rebuild is needed). Shapes are from the open-source
 * Feather icon set (MIT).
 *
 * To add an icon: add its name to IconName and a case to `shapes`.
 */
export type IconName =
  | 'user'
  | 'eye'
  | 'trending-up'
  | 'chevron-right'
  | 'moon'
  | 'sun'
  | 'log-out'
  | 'users'
  | 'calendar'
  | 'clock'
  | 'map-pin'
  | 'camera'
  | 'x'
  | 'chevron-left'
  | 'search'
  | 'alert-circle'
  | 'chevron-down'
  | 'check'
  | 'zap'
  | 'zap-off'
  | 'refresh-cw'
  // added for the map screens
  | 'navigation'
  | 'alert-triangle'
  | 'layers'
  | 'flag'
  | 'crosshair'
  | 'target'
  | 'activity'
  | 'shield'
  | 'user-check'
  | 'map'
  | 'inbox';

type Tone = 'lime' | 'muted' | 'red' | 'neutral';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** theme-aware color; ignored if `color` is given */
  tone?: Tone;
  color?: string;
}

const TONES: Record<Tone, { light: string; dark: string }> = {
  lime: { light: '#4D7C0F', dark: '#A3E635' },
  muted: { light: '#9CA3AF', dark: '#94A3B8' },
  red: { light: '#DC2626', dark: '#F87171' },
  neutral: { light: '#4B5563', dark: '#E2E8F0' },
};

const shapes = (name: IconName): ReactNode => {
  switch (name) {
    case 'user':
      return (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx="12" cy="12" r="3" />
        </>
      );
    case 'trending-up':
      return (
        <>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <Polyline points="17 6 23 6 23 12" />
        </>
      );
    case 'chevron-right':
      return <Polyline points="9 18 15 12 9 6" />;
    case 'moon':
      return <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
    case 'sun':
      return (
        <>
          <Circle cx="12" cy="12" r="5" />
          <Line x1="12" y1="1" x2="12" y2="3" />
          <Line x1="12" y1="21" x2="12" y2="23" />
          <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <Line x1="1" y1="12" x2="3" y2="12" />
          <Line x1="21" y1="12" x2="23" y2="12" />
          <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Polyline points="12 6 12 12 16 14" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <Circle cx="12" cy="10" r="3" />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </>
      );
    case 'x':
      return (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </>
      );
    case 'zap':
      return <Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />;
    case 'zap-off':
      return (
        <>
          <Polyline points="12.41 6.75 13 2 10.57 4.92" />
          <Polyline points="18.57 12.91 21 10 15.66 10" />
          <Polyline points="8 8 3 14 12 14 11 22 16 16" />
          <Line x1="1" y1="1" x2="23" y2="23" />
        </>
      );
    case 'refresh-cw':
      return (
        <>
          <Polyline points="23 4 23 10 17 10" />
          <Polyline points="1 20 1 14 7 14" />
          <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </>
      );
    case 'chevron-down':
      return <Polyline points="6 9 12 15 18 9" />;
    case 'check':
      return <Polyline points="20 6 9 17 4 12" />;
    case 'chevron-left':
      return <Polyline points="15 18 9 12 15 6" />;
    case 'search':
      return (
        <>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
      );
    case 'alert-circle':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="8" x2="12" y2="12" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </>
      );
    case 'users':
      return (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'log-out':
      return (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </>
      );
    case 'navigation':
      return <Polygon points="3 11 22 2 13 21 11 13 3 11" />;
    case 'alert-triangle':
      return (
        <>
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      );
    case 'layers':
      return (
        <>
          <Polygon points="12 2 2 7 12 12 22 7 12 2" />
          <Polyline points="2 17 12 22 22 17" />
          <Polyline points="2 12 12 17 22 12" />
        </>
      );
    case 'flag':
      return (
        <>
          <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <Line x1="4" y1="22" x2="4" y2="15" />
        </>
      );
    case 'crosshair':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="22" y1="12" x2="18" y2="12" />
          <Line x1="6" y1="12" x2="2" y2="12" />
          <Line x1="12" y1="6" x2="12" y2="2" />
          <Line x1="12" y1="22" x2="12" y2="18" />
        </>
      );
    case 'target':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Circle cx="12" cy="12" r="6" />
          <Circle cx="12" cy="12" r="2" />
        </>
      );
    case 'shield':
      return <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
    case 'user-check':
      return (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="8.5" cy="7" r="4" />
          <Polyline points="17 11 19 13 23 9" />
        </>
      );
    case 'map':
      return (
        <>
          <Polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <Line x1="8" y1="2" x2="8" y2="18" />
          <Line x1="16" y1="6" x2="16" y2="22" />
        </>
      );
    case 'inbox':
      return (
        <>
          <Polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <Path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </>
      );
    case 'activity':
      return <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />;
  }
  
};

const Icon = ({
  name,
  size = 20,
  strokeWidth = 2,
  tone = 'lime',
  color,
}: IconProps) => {
  const { colorScheme } = useColorScheme();
  const resolved =
    color ?? TONES[tone][colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={resolved}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes(name)}
    </Svg>
  );
};

export default Icon;
