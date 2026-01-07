import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function Input({
  icon,
  placeholder,
  value,
  onChangeText,
  isPassword = false
}) {
  const { theme, isDarkMode } = useTheme();
  // État local pour gérer la visibilité du mot de passe
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
      {/* Icône à gauche (Mail, Cadenas...) */}
      <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />

      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !isPasswordVisible}
        autoCapitalize="none"
      />

      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    height: 56,
  },
  icon: { marginLeft: 16, marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 10, marginRight: 6 },
});