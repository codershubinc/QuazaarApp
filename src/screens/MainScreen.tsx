import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

import { Header } from '../components/ui/Header';
import { DateTimeCard } from '../components/time/DateTimeCard';
import { PomodoroCard } from '../components/time/PomodoroCard';
import { NowPlayingCard } from '../components/media/NowPlayingCard';
import { QuickActionsCard } from '../components/ui/QuickActionsCard';
import { SystemControlsCard } from '../components/system/SystemControlsCard';
import { Toast } from '../components/ui/Toast';
import { SettingsScreen } from './SettingsScreen';
import { LoginScreen } from './LoginScreen';
import { ActivityFeed } from '../components/productivity/ActivityFeed';
import { TodoCard } from '../components/productivity/TodoCard';
import { SystemStatsCard } from '../components/system/SystemStatsCard';

export const MainScreen = () => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > 600;
    const { isConnected, isConnecting, error, mediaInfo, bluetoothDevices, authToken, setAuthToken } = useAppStore();
    const [currentScreen, setCurrentScreen] = useState<'MAIN' | 'SETTINGS' | 'LOGIN'>('LOGIN');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    setAuthToken(token);
                }
            } catch (e) {
                console.error("Auth check failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (!authToken) {
            setCurrentScreen('LOGIN');
            return;
        } else {
            if (currentScreen === 'LOGIN') setCurrentScreen('MAIN');
        }

        const connect = async () => {
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';

            // Use authToken as the primary authentication method
            const path = `/ws?deviceId=${encodeURIComponent(authToken)}`;

            const url = `ws://${ip}:${port}${path}`;
            webSocketService.connect(url);
        };
        connect();

        return () => {
            webSocketService.close();
        };
    }, [authToken]);

    if (isLoading) {
        return (
            <LinearGradient
                colors={[theme.colors.background, '#161b33', theme.colors.background]}
                style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
            >
                <Text style={{ color: theme.colors.text }}>Loading...</Text>
            </LinearGradient>
        );
    }

    if (currentScreen === 'LOGIN') {
        return <LoginScreen />;
    }

    if (currentScreen === 'SETTINGS') {
        return <SettingsScreen onBack={() => setCurrentScreen('MAIN')} />;
    }

    return (
        <LinearGradient
            colors={[theme.colors.background, '#000000', theme.colors.background]}
            style={[styles.container, { width, height }]}
        >
            <Toast />
            <View style={[styles.scrollView, styles.content]}>
                <Header onSettingsClick={() => setCurrentScreen('SETTINGS')} />
                <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 16, marginBottom: theme.spacing.m }}>
                    <DateTimeCard />
                    <SystemControlsCard />
                    <SystemStatsCard />

                </View>

                {isConnecting && !isConnected && (
                    <View style={styles.statusCard}>
                        <Text style={styles.statusText}>Connecting to server...</Text>
                    </View>
                )}

                {error && (
                    <View style={[styles.statusCard, styles.errorCard]}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={isLandscape ? styles.row : styles.column}>
                    <View style={isLandscape ? styles.columnHalf : styles.column}>
                        {mediaInfo && (mediaInfo.Title || mediaInfo.Artist) && <NowPlayingCard />}
                    </View>
                    <View style={isLandscape ? styles.columnHalf : styles.column}>
                        <QuickActionsCard />
                        <ActivityFeed />
                        <View
                            style={{ flexDirection: isLandscape ? 'row' : 'column', gap: theme.spacing.m, width: 'auto', marginBottom: theme.spacing.m }}

                        >

                            <View style={isLandscape ? { flex: 1 } : undefined}>
                                <PomodoroCard />
                            </View>
                        </View>
                        {/* <SystemOutputCard /> */}
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    statusCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    errorCard: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    statusText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    column: {
        flexDirection: 'column',
        gap: theme.spacing.m,
    },
    columnHalf: {
        flex: 1,
        gap: theme.spacing.m,
    },
});
