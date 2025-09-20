import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { OnboardingData } from '../../data/OnboardingData';
import LottieView from 'lottie-react-native';

type Props = {
  index: number;
  x: SharedValue<number>;
  item: OnboardingData;
};

const RenderItem = ({ index, x, item }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(index);
  const lottieAnimationStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [200, 0, -200],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: translateYAnimation }],
    };
  });

  useAnimatedReaction(
    () => x.value,
    value => {
      const newIndex = Math.round(value / SCREEN_WIDTH); // convert px -> index
      runOnJS(setCurrentIndex)(newIndex);
    },
    [SCREEN_WIDTH],
  );

  const circleAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [1, 4, 4],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale: scale }],
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    };
  });

  return (
    <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            {
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH,
              borderRadius: SCREEN_WIDTH / 2,
              backgroundColor: item.backgroundColor,
            },
            circleAnimation,
          ]}
        />
      </View>
      <Animated.View style={lottieAnimationStyle}>
        <View
          style={{
            position: 'absolute',
            top: -100,
            left: -110,
            width: 200, // set size
            height: 200, // same as width
            backgroundColor: '#88AA55',
            borderRadius: 100,
            zIndex: -2, // half of width/height
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            right: -60,
            width: 100, // set size
            height: 100, // same as width
            backgroundColor: '#88AA55',
            borderRadius: 100,
            zIndex: -2, // half of width/height
          }}
        />
        <Image
          source={require('../../assets/img/Barangay.png')}
          style={{
            position: 'absolute',
            top: -10,
            right: 5,
            width: 50, // set size
            height: 50, // same as width

            zIndex: -2, // half of width/height
          }}
        />
        <LottieView
          source={item.animation}
          style={{
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
          }}
          autoPlay
          loop
        />
      </Animated.View>
      {currentIndex !== 1 && (
        <View>
          <Text style={[styles.itemText]}>{item.text}</Text>
          <Text style={[styles.itemDescription]}>{item.description}</Text>
        </View>
      )}
      {currentIndex === 1 && (
        <View>
          <Text style={[styles.itemTextDark]}>{item.text}</Text>
          <Text style={[styles.itemDescriptionDark]}>{item.description}</Text>
        </View>
      )}
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 120,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#5B5B5B',
  },
  itemDescription: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 30,
    marginHorizontal: 20,
    color: '#717171',
  },
  itemTextDark: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 20,
    color: 'white',
  },
  itemDescriptionDark: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 30,
    marginHorizontal: 20,
    color: 'white',
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
