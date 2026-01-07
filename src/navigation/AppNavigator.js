// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Import Stack
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useTheme } from '../theme/ThemeContext'; // Use Context
import { useLanguage } from '../context/LanguageContext';
import { AnimatedTabIcon } from '../components/AnimatedTabIcon';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; // Import Edit
import AuthScreen from '../screens/AuthScreen';
import NewsScreen from '../screens/NewsScreen';
import WelcomeScreen from '../screens/WelcomeScreen'; // Import Welcome

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Profile Tab to handle EditProfile navigation
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

// Stack for Auth Flow
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const { theme, isDarkMode } = useTheme(); // Get theme from context
  const { t } = useLanguage();

  // Écouter l'état de connexion Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // Écran de chargement pendant que Firebase vérifie le token
  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        // Pas connecté, affiche AuthStack (Welcome -> Auth)
        <AuthStack />
      ) : (
        // Connecte affiche le navigator
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopColor: isDarkMode ? '#333' : '#E5E5EA',
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
              paddingTop: 10,
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'football' : 'football-outline';
              else if (route.name === 'News') iconName = focused ? 'newspaper' : 'newspaper-outline';
              else if (route.name === 'Matches') iconName = focused ? 'calendar' : 'calendar-outline';
              else if (route.name === 'Favorites') iconName = focused ? 'star' : 'star-outline';
              else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

              return <AnimatedTabIcon focused={focused} name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('nav_home') }} />
          <Tab.Screen name="News" component={NewsScreen} options={{ title: t('nav_news') }} />
          <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: t('nav_matches') }} />
          <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('nav_favorites') }} />
          <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: t('nav_profile') }} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}