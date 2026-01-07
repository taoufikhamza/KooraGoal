import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME as DARK_THEME } from './colors';

// Define Light Theme
const LIGHT_THEME = {
    background: '#F2F2F7', // iOS Light Gray
    card: '#FFFFFF',
    primary: '#CCFF00',
    text: '#000000',
    textSecondary: '#8E8E93',
    error: '#FF3B30',
    success: '#34C759',
    tabBar: '#FFFFFF',
};

// Re-export constants for easy access if needed, but Context is preferred
export const Themes = {
    dark: DARK_THEME,
    light: LIGHT_THEME
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [theme, setTheme] = useState(DARK_THEME);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                const isDark = savedTheme === 'dark';
                setIsDarkMode(isDark);
                setTheme(isDark ? DARK_THEME : LIGHT_THEME);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        setTheme(newMode ? DARK_THEME : LIGHT_THEME);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
