import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

import { Header } from '../components/Header';
import { DateTimeCard } from '../components/DateTimeCard';
import { NowPlayingCard } from '../components/NowPlayingCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { SystemControlsCard } from '../components/SystemControlsCard';
import { BluetoothDevicesCard } from '../components/BluetoothDevicesCard';
import { SystemOutputCard } from '../components/SystemOutputCard';
import { SettingsScreen } from './SettingsScreen';

export const MainScreen = () => {
    const { width } = useWindowDimensions();
    const isLandscape = width > 600;
    const { isConnected, isConnecting, error, mediaInfo, bluetoothDevices } = useAppStore();
    const [currentScreen, setCurrentScreen] = useState<'MAIN' | 'SETTINGS'>('MAIN');

    useEffect(() => {
        const connect = async () => {
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';
            const path = await AsyncStorage.getItem('path') || '/ws?deviceId=$2a$10$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2';
            const url = `ws://${ip}:${port}${path}`;
            webSocketService.connect(url);
        };
        connect();

        return () => {
            webSocketService.close();
        };
    }, []);

    if (currentScreen === 'SETTINGS') {
        return <SettingsScreen onBack={() => setCurrentScreen('MAIN')} />;
    }

    return (
        <LinearGradient
            colors={[theme.colors.background, '#161b33', theme.colors.background]}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Header onSettingsClick={() => setCurrentScreen('SETTINGS')} />
                <DateTimeCard />

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
                        {bluetoothDevices && bluetoothDevices.length > 0 && <BluetoothDevicesCard />}
                        <QuickActionsCard />
                        <SystemControlsCard />
                        <SystemOutputCard />
                    </View>
                </View>
            </ScrollView>
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
