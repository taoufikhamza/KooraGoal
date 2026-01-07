import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const LanguageSelectorModal = ({ visible, onClose, onSelect, currentLanguage }) => {
    const { theme } = useTheme();

    const languages = [
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    {currentLanguage === 'fr' ? 'Choisir la langue' : 'Choose Language'}
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.option,
                                        {
                                            backgroundColor: currentLanguage === lang.code ? theme.primary + '20' : 'transparent',
                                            borderColor: theme.border
                                        }
                                    ]}
                                    onPress={() => {
                                        onSelect(lang.code);
                                        onClose();
                                    }}
                                >
                                    <View style={styles.optionContent}>
                                        <Text style={styles.flag}>{lang.flag}</Text>
                                        <Text style={[
                                            styles.label,
                                            {
                                                color: currentLanguage === lang.code ? theme.primary : theme.text,
                                                fontWeight: currentLanguage === lang.code ? 'bold' : 'normal'
                                            }
                                        ]}>
                                            {lang.label}
                                        </Text>
                                    </View>
                                    {currentLanguage === lang.code && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: 24,
        marginRight: 15,
    },
    label: {
        fontSize: 16,
    },
});

export default LanguageSelectorModal;
