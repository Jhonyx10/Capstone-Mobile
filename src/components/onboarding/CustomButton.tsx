import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import Animated, {
  AnimatedRef,
  SharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { OnboardingData } from '../../data/OnboardingData';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  dataLength: number;
  flatListIndex: SharedValue<number>;
  flatListRef: AnimatedRef<FlatList<OnboardingData>>;
  x: SharedValue<number>;
};

const CustomButton = ({ flatListRef, flatListIndex, dataLength }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Local React state to trigger re-renders
  const [currentIndex, setCurrentIndex] = useState(flatListIndex.value);

  // Sync Reanimated value -> React state
  useAnimatedReaction(
    () => flatListIndex.value,
    value => {
      runOnJS(setCurrentIndex)(value);
    },
  );

  const goNext = () => {
    if (flatListIndex.value < dataLength - 1) {
      flatListRef.current?.scrollToIndex({
        index: flatListIndex.value + 1,
      });
    } else {
      navigation.navigate('welcome');
    }
  };

  const skip = () => {
    navigation.navigate('welcome');
  };

  return (
    <View style={{ width: '100%', gap: 10 }}>
      {/* IF not last page → show Skip + Next */}
      {currentIndex < dataLength - 1 && (
        <>
          {/* Next Button */}
          <TouchableWithoutFeedback onPress={goNext}>
            <Animated.View style={styles.container}>
              <LinearGradient
                colors={['#A9C46C', '#5D8736']}
                style={StyleSheet.absoluteFill}
              />
              <Animated.Text style={styles.arrow}>Next</Animated.Text>
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Skip Button */}
          <TouchableWithoutFeedback onPress={skip}>
            <Animated.View style={[styles.container, styles.skipButton]}>
              {currentIndex === 1 && (
                <Animated.Text style={styles.textSkipDark}>Skip</Animated.Text>
              )}
              {currentIndex === 0 && (
                <Animated.Text style={styles.textSkip}>Skip</Animated.Text>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </>
      )}

      {/* IF last page → show Get Started */}
      {currentIndex === dataLength - 1 && (
        <View style={{ marginBottom: 35, marginTop: 30 }}>
          <TouchableWithoutFeedback onPress={goNext}>
            <Animated.View style={styles.container}>
              <LinearGradient
                colors={['#A9C46C', '#5D8736']}
                style={StyleSheet.absoluteFill}
              />
              <Animated.Text style={styles.textButton}>
                Get Started
              </Animated.Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e2169',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#5D8736',
  },
  arrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSkip: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSkipDark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
