import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/useAppStore';

export const SettingsScreen = ({ onBack }: { onBack: () => void }) => {
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const [path, setPath] = useState('');
    const { backgroundImage, setBackgroundImage } = useAppStore();

    useEffect(() => {
        const loadSettings = async () => {
            setIp(await AsyncStorage.getItem('ip') || '192.168.1.110');
            setPort(await AsyncStorage.getItem('port') || '8765');
            setPath(await AsyncStorage.getItem('path') || '/ws?deviceId=$2a$10$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2');

            // Load background image from storage
            const savedBg = await AsyncStorage.getItem('backgroundImage');
            if (savedBg) {
                setBackgroundImage(savedBg);
            }
        };
        loadSettings();
    }, []);

    const handleConnect = async () => {
        await AsyncStorage.setItem('ip', ip);
        await AsyncStorage.setItem('port', port);
        await AsyncStorage.setItem('path', path);
        const url = `ws://${ip}:${port}${path}`;
        webSocketService.connect(url);
        onBack();
    };

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photo library');
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setBackgroundImage(uri);
            await AsyncStorage.setItem('backgroundImage', uri);
        }
    };

    const removeBackground = async () => {
        setBackgroundImage(null);
        await AsyncStorage.removeItem('backgroundImage');
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, '#161b33', theme.colors.background]}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SETTINGS</Text>
            </View>

            <ScrollView style={styles.content}>
                <LinearGradient
                    colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="server-outline" size={24} color={theme.colors.secondary} />
                        <Text style={styles.cardTitle}>Connection</Text>
                    </View>

                    <Text style={styles.label}>IP Address</Text>
                    <TextInput
                        style={styles.input}
                        value={ip}
                        onChangeText={setIp}
                        placeholder="192.168.1.110"
                        placeholderTextColor={theme.colors.textDim}
                    />

                    <Text style={styles.label}>Port</Text>
                    <TextInput
                        style={styles.input}
                        value={port}
                        onChangeText={setPort}
                        placeholder="8765"
                        placeholderTextColor={theme.colors.textDim}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Path</Text>
                    <TextInput
                        style={styles.input}
                        value={path}
                        onChangeText={setPath}
                        placeholder="/ws"
                        placeholderTextColor={theme.colors.textDim}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleConnect}>
                        <LinearGradient
                            colors={[theme.colors.secondary, theme.colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Connect</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                    colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="image-outline" size={24} color={theme.colors.secondary} />
                        <Text style={styles.cardTitle}>Background</Text>
                    </View>

                    <Text style={styles.label}>Main Screen Background Image</Text>

                    {backgroundImage && (
                        <View style={styles.imagePreview}>
                            <Image
                                source={{ uri: backgroundImage }}
                                style={styles.previewImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={pickImage}>
                            <LinearGradient
                                colors={[theme.colors.secondary, theme.colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Ionicons name="images" size={20} color={theme.colors.background} style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Select Image</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {backgroundImage && (
                            <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={removeBackground}>
                                <LinearGradient
                                    colors={['#ff6b6b', '#ee5a52']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>Remove</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingTop: theme.spacing.xl,
    },
    backButton: {
        padding: theme.spacing.s,
        marginRight: theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        letterSpacing: 2,
    },
    content: {
        padding: theme.spacing.m,
    },
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.default,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        gap: theme.spacing.s,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
        fontSize: 14,
        marginLeft: theme.spacing.s,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    button: {
        marginTop: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.glow,
    },
    buttonGradient: {
        padding: theme.spacing.m,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginTop: theme.spacing.s,
    },
    flexButton: {
        flex: 1,
    },
});
