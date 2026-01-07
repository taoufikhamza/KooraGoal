import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import RotatingLogo from '../components/RotatingLogo';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const handleGoogleLogin = async () => {
        const canOpen = await Linking.canOpenURL('https://accounts.google.com/signin');
        if (canOpen) {
            await Linking.openURL('https://accounts.google.com/signin');
        }
    };

    const handleAppleLogin = async () => {
        const canOpen = await Linking.canOpenURL('https://appleid.apple.com');
        if (canOpen) {
            await Linking.openURL('https://appleid.apple.com');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

            {/* CENTER CONTENT */}
            <View style={styles.centerContent}>
                <RotatingLogo size={80} />
                <Text style={[styles.title, { color: theme.text }]}>
                    KOORA<Text style={{ color: theme.primary }}>GOAL!</Text>
                </Text>
            </View>

            {/* BOTTOM BUTTONS */}
            <View style={styles.bottomContainer}>

                {/* Email Button (Primary) */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#CCFF00' }]}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <Ionicons name="mail" size={20} color="#000" style={styles.icon} />
                    <Text style={[styles.buttonText, { color: '#000' }]}>Continue with Email</Text>
                </TouchableOpacity>

                {/* Google Button */}
                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, { backgroundColor: theme.card }]}
                    onPress={handleGoogleLogin}
                >
                    <Ionicons name="logo-google" size={20} color={theme.text} style={styles.icon} />
                    <Text style={[styles.buttonText, { color: theme.text }]}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Button */}
                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, { backgroundColor: theme.card }]}
                    onPress={handleAppleLogin}
                >
                    <Ionicons name="logo-apple" size={20} color={theme.text} style={styles.icon} />
                    <Text style={[styles.buttonText, { color: theme.text }]}>Continue with Apple</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        fontStyle: 'italic',
        marginTop: 20,
        letterSpacing: 1,
    },
    bottomContainer: {
        width: '100%',
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        width: '100%',
    },
    secondaryButton: {
        // Optional: add border if needed for contrast on dark implementation
        // borderWidth: 1,
        // borderColor: '#333'
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
