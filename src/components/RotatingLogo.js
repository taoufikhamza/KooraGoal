import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function RotatingLogo({ size = 60, style, withText = false }) {
    const { theme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startRotation = () => {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        startRotation();
    }, [rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={{
                width: size,
                height: size,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ rotate: spin }]
            }}>
                <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>⚽</Text>
            </Animated.View>
            {withText && (
                <View style={styles.textContainer}>
                    <Text style={[styles.textAll, { fontSize: size * 0.7, color: theme.text }]}>KOORA</Text>
                    <Text style={[styles.textGoal, { fontSize: size * 0.7, color: theme.primary }]}>GOAL!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBall: {
        textAlign: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    textAll: {
        fontWeight: '900',
        letterSpacing: -1,
    },
    textGoal: {
        fontWeight: '900',
        letterSpacing: -1,
    },
});
