import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RotatingLogo from './RotatingLogo';
import { useTheme } from '../theme/ThemeContext';

export default function Header({
    title,
    showLogo = true,
    rightIcons = []
}) {
    const { theme, isDarkMode } = useTheme();

    return (
        <View style={[styles.header, { backgroundColor: theme.background }]}>
            <View style={styles.leftContainer}>
                {showLogo ? (
                    <View style={[styles.logoPill, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                        <RotatingLogo size={24} withText={true} />
                    </View>
                ) : (
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                )}
            </View>

            <View style={styles.rightIcons}>
                {rightIcons.map((icon, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.iconButtonRounded, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}
                        onPress={icon.onPress}
                    >
                        <MaterialCommunityIcons name={icon.name} size={20} color={theme.text} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    logoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightIcons: {
        flexDirection: 'row',
    },
    iconButtonRounded: {
        marginLeft: 10,
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
