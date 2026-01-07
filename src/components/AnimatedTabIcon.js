import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AnimatedTabIcon = ({ focused, name, size, color }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (focused) {
            Animated.spring(scale, {
                toValue: 1.2,
                useNativeDriver: true,
                friction: 5,
                tension: 100,
            }).start();
        } else {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5,
                tension: 100,
            }).start();
        }
    }, [focused]);

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={name} size={size} color={color} />
        </Animated.View>
    );
};
