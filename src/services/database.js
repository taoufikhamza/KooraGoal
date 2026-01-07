import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kooragoal_favorites';

let db;
const isWeb = Platform.OS === 'web';

// Initialize SQLite only on native platforms
if (!isWeb) {
    try {
        db = SQLite.openDatabaseSync('kooragoal.db');
    } catch (error) {
        console.error("Error opening database:", error);
    }
}

export const initDatabase = async () => {
    if (isWeb) {
        // On web, AsyncStorage is already initialized, just verify
        try {
            const existing = await AsyncStorage.getItem(STORAGE_KEY);
            if (!existing) {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            }
            console.log('Web storage initialized successfully');
        } catch (error) {
            console.error('Error initializing web storage:', error);
        }
    } else {
        // On native, use SQLite
        try {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS favorites_v1 (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    logo TEXT,
                    country TEXT,
                    team TEXT,
                    image TEXT
                );
            `);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
};

export const getFavorites = async () => {
    if (isWeb) {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error fetching favorites from web storage:', error);
            return [];
        }
    } else {
        try {
            const result = await db.getAllAsync('SELECT * FROM favorites_v1');
            return result;
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    }
};

export const addFavorite = async (item, type) => {
    try {
        // Normalize fields based on type
        const favoriteItem = {
            id: item.id,
            name: item.name,
            type: type,
            logo: item.logo || null,
            country: item.country || null,
            team: item.team || null,
            image: item.image || null
        };

        if (isWeb) {
            // On web, use AsyncStorage
            const favorites = await getFavorites();
            // Remove existing favorite with same id if exists
            const filtered = favorites.filter(f => f.id !== item.id);
            // Add new favorite
            filtered.push(favoriteItem);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            console.log('Added favorite to web storage:', item.name);
        } else {
            // On native, use SQLite
            await db.runAsync(
                'INSERT OR REPLACE INTO favorites_v1 (id, name, type, logo, country, team, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [favoriteItem.id, favoriteItem.name, favoriteItem.type, favoriteItem.logo, favoriteItem.country, favoriteItem.team, favoriteItem.image]
            );
            console.log('Added favorite:', item.name);
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
    }
};

export const removeFavorite = async (id) => {
    try {
        if (isWeb) {
            // On web, use AsyncStorage
            const favorites = await getFavorites();
            const filtered = favorites.filter(f => f.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            console.log('Removed favorite from web storage:', id);
        } else {
            // On native, use SQLite
            await db.runAsync('DELETE FROM favorites_v1 WHERE id = ?', [id]);
            console.log('Removed favorite:', id);
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
    }
};
