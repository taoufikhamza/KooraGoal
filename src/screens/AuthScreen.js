import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext'; // Imported useLanguage
import Input from '../components/Input';
import { Ionicons } from '@expo/vector-icons';
import RotatingLogo from '../components/RotatingLogo';

export default function AuthScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage(); // Using useLanguage
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Gestion Email / Password ---
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      let message = "Une erreur est survenue.";
      if (error.code === 'auth/invalid-credential') message = "Identifiants incorrects.";
      else if (error.code === 'auth/email-already-in-use') message = "Email déjà utilisé.";
      else if (error.code === 'auth/weak-password') message = "Mot de passe trop court.";
      Alert.alert('Oups !', message);
    } finally {
      setLoading(false);
    }
  };

  // --- Mock Gestion Social Auth ---
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* HEADER */}
          <View style={styles.header}>
            <RotatingLogo size={50} />
            <Text style={[styles.title, { color: theme.text }]}>
              KOORA<Text style={{ color: theme.primary }}>GOAL!</Text>
            </Text>
          </View>

          {/* TOGGLE */}
          <View style={[styles.toggleContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isLogin && { backgroundColor: theme.primary }]}
              onPress={() => setIsLogin(false)}>
              <Text style={[styles.toggleText, { color: !isLogin ? '#000' : theme.textSecondary, fontWeight: !isLogin ? 'bold' : '600' }]}>{t('signup')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isLogin && { backgroundColor: theme.primary }]}
              onPress={() => setIsLogin(true)}>
              <Text style={[styles.toggleText, { color: isLogin ? '#000' : theme.textSecondary, fontWeight: isLogin ? 'bold' : '600' }]}>{t('login')}</Text>
            </TouchableOpacity>
          </View>

          {/* FORMULAIRE CLASSIQUE */}
          <View style={styles.form}>
            <Input
              icon="mail-outline"
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
            />
            <Input
              icon="lock-closed-outline"
              placeholder={t('password')}
              isPassword={true}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary }]} onPress={handleAuth} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {isLogin ? t('login_btn') : t('signup_btn')}
                </Text>
              )}
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>{t('forgot_password')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SÉPARATEUR */}
          <View style={styles.dividerContainer}>
            <View style={[styles.line, { backgroundColor: theme.textSecondary }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>{t('or_continue_with')}</Text>
            <View style={[styles.line, { backgroundColor: theme.textSecondary }]} />
          </View>

          {/* BOUTONS SOCIAUX */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.card, borderColor: theme.textSecondary }]} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color={theme.text} />
              <Text style={[styles.socialText, { color: theme.text }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.card, borderColor: theme.textSecondary }]} onPress={handleAppleLogin}>
              <Ionicons name="logo-apple" size={24} color={theme.text} />
              <Text style={[styles.socialText, { color: theme.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, justifyContent: 'center', minHeight: '100%' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', marginLeft: 10, fontStyle: 'italic' },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  toggleText: {},

  // Form
  form: { marginTop: 10 },
  mainButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mainButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  forgotBtn: { alignItems: 'center', marginTop: 20 },
  forgotText: { fontSize: 14 },

  // Socials
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 12 },

  socialContainer: { gap: 12 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 50,
    borderRadius: 12,
    marginBottom: 10
  },
  socialText: {
    fontWeight: '600',
    marginLeft: 10,
  }
});