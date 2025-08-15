import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ 
  targetDate, 
  style, 
  textStyle,
  showLabels = true,
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  if (compact) {
    return (
      <Text style={[styles.compactText, textStyle]}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m
      </Text>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timeUnit}>
        <Text style={[styles.number, textStyle]}>{formatNumber(timeLeft.days)}</Text>
        {showLabels && <Text style={[styles.label, textStyle]}>Days</Text>}
      </View>
      <Text style={[styles.separator, textStyle]}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={[styles.number, textStyle]}>{formatNumber(timeLeft.hours)}</Text>
        {showLabels && <Text style={[styles.label, textStyle]}>Hours</Text>}
      </View>
      <Text style={[styles.separator, textStyle]}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={[styles.number, textStyle]}>{formatNumber(timeLeft.minutes)}</Text>
        {showLabels && <Text style={[styles.label, textStyle]}>Min</Text>}
      </View>
      <Text style={[styles.separator, textStyle]}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={[styles.number, textStyle]}>{formatNumber(timeLeft.seconds)}</Text>
        {showLabels && <Text style={[styles.label, textStyle]}>Sec</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 40,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 8,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default CountdownTimer;

