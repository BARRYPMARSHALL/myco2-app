import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

const AnimatedCounter = ({ 
  endValue, 
  duration = 1000, 
  style, 
  suffix = '', 
  prefix = '',
  decimals = 0 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const textRef = useRef();

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      if (textRef.current) {
        const formattedValue = decimals > 0 
          ? value.toFixed(decimals)
          : Math.floor(value).toLocaleString();
        textRef.current.setNativeProps({
          text: `${prefix}${formattedValue}${suffix}`
        });
      }
    });

    Animated.timing(animatedValue, {
      toValue: endValue,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [endValue, duration, prefix, suffix, decimals]);

  return (
    <Text ref={textRef} style={style}>
      {prefix}0{suffix}
    </Text>
  );
};

export default AnimatedCounter;

