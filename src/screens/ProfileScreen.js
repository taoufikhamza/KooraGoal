import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import LogoutModal from '../components/LogoutModal';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { t, language, changeLanguage } = useLanguage();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

    // Local state for user data to ensure it refreshes on focus
    const [userData, setUserData] = useState({
        displayName: auth.currentUser?.displayName,
        email: auth.currentUser?.email,
        photoURL: auth.currentUser?.photoURL,
    });

    useFocusEffect(
        React.useCallback(() => {
            if (auth.currentUser) {
                // Force update local state with latest auth data
                setUserData({
                    displayName: auth.currentUser.displayName,
                    email: auth.currentUser.email,
                    photoURL: auth.currentUser.photoURL,
                });
            }
        }, [])
    );

    const handleSignOut = () => {
        setLogoutModalVisible(true);
    };

    const confirmSignOut = async () => {
        setLogoutModalVisible(false);
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
            Alert.alert(t('error') || 'Erreur', t('logout_error') || "Impossible de se déconnecter");
        }
    };

    const renderSectionHeader = (title) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: theme.textSecondary }]}>{title}</Text>
        </View>
    );

    const renderMenuItem = (icon, title, onPress, rightElement = null, isDestructive = false) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FFEBEE' : (isDarkMode ? '#333' : '#F2F2F7') }]}>
                    <Ionicons name={icon} size={20} color={isDestructive ? '#FF3B30' : theme.text} />
                </View>
                <Text style={[styles.menuItemText, { color: isDestructive ? '#FF3B30' : theme.text }]}>{title}</Text>
            </View>
            {rightElement ? rightElement : (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{t('profile_title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* User Card */}
                <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                    <Image
                        source={{ uri: userData.photoURL || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{userData.displayName || 'Utilisateur'}</Text>
                        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{userData.email}</Text>
                    </View>
                </View>

                {/* General Section */}
                {renderSectionHeader(t('general_section'))}
                {renderMenuItem("person-outline", t('personal_info'), () => {
                  try {
                    navigation.navigate('EditProfile');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    Alert.alert('Erreur', 'Impossible d\'ouvrir la page de modification du profil');
                  }
                })}


                {/* Preferences Section */}
                {renderSectionHeader(t('preferences_section'))}
                {renderMenuItem("language-outline", t('language'), () => setLanguageModalVisible(true),
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, marginRight: 8 }}>{language === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
                        <Text style={{ color: theme.textSecondary, marginRight: 5 }}>
                            {language === 'fr' ? 'Français' : 'English'}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </View>
                )}
                {renderMenuItem("notifications-outline", t('notifications'), () => setNotificationsEnabled(!notificationsEnabled), (
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#767577", true: theme.primary }}
                        thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
                    />
                ))}
                {renderMenuItem("moon-outline", t('dark_mode'), () => toggleTheme(), (
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: theme.primary }}
                        thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
                    />
                ))}

                {/* Modals */}
                <LanguageSelectorModal
                    visible={isLanguageModalVisible}
                    onClose={() => setLanguageModalVisible(false)}
                    onSelect={changeLanguage}
                    currentLanguage={language}
                />

                <LogoutModal
                    visible={isLogoutModalVisible}
                    onClose={() => setLogoutModalVisible(false)}
                    onLogout={confirmSignOut}
                />

                {/* Support Section */}
                {renderSectionHeader(t('support_section'))}
                {renderMenuItem("help-circle-outline", t('help_center'), () => Alert.alert(t('help_center'), "Contactez support@kooragoal.com"))}
                {renderMenuItem("lock-closed-outline", t('privacy_policy'), () => Alert.alert(t('privacy_policy'), "Afficher la page web de confidentialité..."))}
                {renderMenuItem("share-social-outline", t('share_app'), () => Alert.alert(t('share_app'), "Ouvre la fenêtre de partage native..."))}
                {renderMenuItem("star-outline", t('rate_app'), () => Alert.alert(t('rate_app'), "Redirige vers le Store..."))}
                {renderMenuItem("trash-outline", t('delete_account'), () => Alert.alert(t('delete_account'), "Cette action est irréversible."), null, true)}
                {renderMenuItem("log-out-outline", t('sign_out'), handleSignOut, null, true)}

                <Text style={[styles.versionText, { color: theme.textSecondary }]}>{t('version')} 1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 25,
        marginTop: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    sectionHeader: {
        marginBottom: 10,
        marginTop: 10,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
    },
});
