import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const STAGGER = 70; // ms between siblings
const MAX_STEPS = 8; // later items don't wait longer than this many steps

interface EnterProps extends ViewProps {
  /** position in the sequence: higher = enters later */
  index?: number;
  /** 'bottom' rises up into place (cards, content), 'top' drops in (headers) */
  from?: 'top' | 'bottom';
  /** render with no animation (e.g. list rows that mount while scrolling) */
  skip?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Fade + slide entrance. Wrap any block in <Enter index={n}> and it plays
 * once when it mounts. Runs on the UI thread via Reanimated.
 */
const Enter = ({
  index = 0,
  from = 'bottom',
  skip = false,
  children,
  ...rest
}: EnterProps) => {
  const preset = from === 'top' ? FadeInDown : FadeInUp;
  const entering = skip
    ? undefined
    : preset
        .delay(Math.min(index, MAX_STEPS) * STAGGER)
        .duration(420)
        .easing(Easing.out(Easing.cubic));

  return (
    <Animated.View entering={entering} {...rest}>
      {children}
    </Animated.View>
  );
};

export default Enter;
