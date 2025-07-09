import { Animated, Easing } from 'react-native';

/**
 * Animation utilities to mimic the CSS animations in global.css
 */

/**
 * Creates a fade-in animation that translates from y+20 to y
 * @param animatedValue The Animated.Value to animate
 * @param duration Duration in milliseconds (default: 800ms)
 * @param delay Optional delay in milliseconds
 * @returns Animation object that can be started
 */
export const fadeIn = (animatedValue: Animated.Value, duration = 800, delay = 0) => {
  animatedValue.setValue(0);
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation style for fade-in
 * @param animatedValue The animated value to use
 * @returns Style object with opacity and transform
 */
export const getFadeInStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    },
  ],
});

/**
 * Creates a sequence of animations with proper delay
 * @param animations Array of animation configurations
 * @returns Array of animation objects ready to be used with Animated.sequence or Animated.parallel
 */
export const createAnimationSequence = (
  animations: { value: Animated.Value; duration?: number; delay?: number }[]
) => {
  return animations.map((anim) => 
    fadeIn(anim.value, anim.duration || 800, anim.delay || 0)
  );
};

/**
 * Helper to create animations with common delays from global.css
 */
export const delays = {
  none: 0,
  d200: 200,
  d300: 300,
  d400: 400,
  d500: 500,
  d600: 600,
  d1000: 1000,
};

/**
 * Creates a bouncing animation
 * @param animatedValue The Animated.Value to animate
 * @param distance Distance to bounce in pixels
 * @param duration Duration in milliseconds
 * @returns Animation object that can be started
 */
export const bounce = (animatedValue: Animated.Value, distance = 10, duration = 500) => {
  animatedValue.setValue(0);
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: -distance,
      duration: duration / 2,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 2,
      easing: Easing.bounce,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Creates a looping animation
 * @param animation Animation to loop
 * @returns Looping animation
 */
export const loop = (animation: Animated.CompositeAnimation) => {
  return Animated.loop(animation);
};
