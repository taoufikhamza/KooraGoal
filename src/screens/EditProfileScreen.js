import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../services/firebaseConfig';
import { updateProfile, updateEmail, updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';

export default function EditProfileScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const user = auth.currentUser;

    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(user?.photoURL);
    const [modalVisible, setModalVisible] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const [currentPassword, setCurrentPassword] = useState('');

    const handleSave = async () => {
        setLoading(true);
        try {
            // Re-authenticate if changing sensitive data (password or email) or if currentPassword is provided
            if ((password.length > 0 || email !== user.email) && currentPassword.length > 0) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            } else if (password.length > 0 && currentPassword.length === 0) {
                Alert.alert('Erreur', 'Veuillez saisir votre mot de passe actuel pour définir un nouveau mot de passe.');
                setLoading(false);
                return;
            }

            if (name !== user.displayName || image !== user.photoURL) {
                await updateProfile(user, { displayName: name, photoURL: image });
            }
            if (email !== user.email) {
                await updateEmail(user, email);
            }
            if (password.length > 0) {
                await updatePassword(user, password);
            }
            Alert.alert('Succès', 'Profil mis à jour avec succès');
            navigation.goBack();
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Sécurité', 'Veuillez saisir votre mot de passe actuel et réessayer.');
            } else if (error.code === 'auth/wrong-password') {
                Alert.alert('Erreur', 'Mot de passe actuel incorrect.');
            } else {
                Alert.alert('Erreur', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setModalVisible(false);
            await signOut(auth);
            // Navigation will be handled by onAuthStateChanged in AppNavigator
        } catch (error) {
            Alert.alert('Erreur', "Impossible de se déconnecter");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Modifier le profil</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>Enregistrer</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: image || 'https://i.pravatar.cc/300' }}
                            style={[styles.avatar, { borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}
                        />
                        <View style={[styles.cameraIconContainer, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                            <Ionicons name="camera" size={16} color={theme.text} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>

                    <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                        <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nom"
                            placeholderTextColor={theme.textSecondary}
                        />
                        <Ionicons name="pencil" size={16} color={theme.primary} />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                        <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="email-address"
                        />
                        <Ionicons name="pencil" size={16} color={theme.primary} />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                        <Ionicons name="key-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Mot de passe actuel"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Nouveau mot de passe (optionnel)"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry
                        />
                    </View>

                </View>

                {/* Main Save Button for better visibility */}
                <TouchableOpacity
                    style={[styles.mainSaveButton, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.mainSaveButtonText}>Enregistrer les modifications</Text>
                    )}
                </TouchableOpacity>

                {/* Footer Sign Out moved inside ScrollView */}
                <TouchableOpacity
                    style={styles.footerSignOut}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[styles.signOutText, { color: theme.error }]}>Options de déconnexion</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Custom Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalHandle, { backgroundColor: isDarkMode ? '#333' : '#E5E5EA' }]} />

                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: isDarkMode ? '#333' : '#F2F2F7' }]} onPress={handleSignOut}>
                            <Text style={[styles.modalButtonText, { color: theme.text }]}>Se déconnecter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'transparent', marginTop: 10 }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    form: {
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    footerSignOut: {
        marginTop: 30,
        alignSelf: 'center',
        marginBottom: 20
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainSaveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainSaveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
