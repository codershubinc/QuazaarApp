import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const { setAuthToken, setUsername: setStoreUsername } = useAppStore();

    useEffect(() => {
        const loadSettings = async () => {
            const savedIp = await AsyncStorage.getItem('ip');
            if (savedIp) {
                setIpAddress(savedIp);
            } else {
                setIpAddress('192.168.1.110');
            }
        };
        loadSettings();
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        setLocalError(null);

        try {
            await AsyncStorage.setItem('ip', ipAddress);
            const port = await AsyncStorage.getItem('port') || '8765';

            const response = await fetch(`http://${ipAddress}:${port}/api/v0.1/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            if (data.token) {
                await AsyncStorage.setItem('authToken', data.token);
                await AsyncStorage.setItem('username', username);

                if (data.deviceId) {
                    await AsyncStorage.setItem('deviceId', data.deviceId);
                }

                setAuthToken(data.token);
                setStoreUsername(username);
            } else {
                throw new Error('No auth token received');
            }
        } catch (err: any) {
            setLocalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, '#161b33', theme.colors.background]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Ionicons name="planet" size={64} color={theme.colors.secondary} />
                        <Text style={styles.title}>Quazaar</Text>
                        <Text style={styles.subtitle}>System Access</Text>
                    </View>

                    <View style={styles.form}>
                        {localError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{localError}</Text>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Ionicons name="server-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Server IP"
                                placeholderTextColor={theme.colors.textDim}
                                value={ipAddress}
                                onChangeText={setIpAddress}
                                autoCapitalize="none"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor={theme.colors.textDim}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.text} />
                            ) : (
                                <Text style={styles.loginButtonText}>LOGIN</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.default,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: theme.spacing.m,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    form: {
        gap: theme.spacing.l,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.m,
    },
    inputIcon: {
        marginRight: theme.spacing.s,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        paddingVertical: theme.spacing.m,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        marginTop: theme.spacing.s,
    },
    loginButtonText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderColor: theme.colors.error,
        borderWidth: 1,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
    },
});
