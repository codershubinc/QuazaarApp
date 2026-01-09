import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { BluetoothDevice } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getIconName = (serverIcon?: string): keyof typeof Ionicons.glyphMap => {
    switch (serverIcon) {
        case 'audio-headset': return 'headset';
        case 'audio-headphones': return 'headset';
        case 'phone': return 'phone-portrait';
        case 'computer': return 'desktop';
        case 'input-keyboard': return 'keypad';
        case 'input-mouse': return 'hardware-chip-outline'; // Close enough
        default: return 'bluetooth';
    }
};

export const BluetoothDisplay = () => {
    const { authToken } = useAppStore();
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);

    useEffect(() => {
        let cleanup = () => { };

        const fetchDevices = async () => {
            if (!authToken) return;
            try {
                const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
                const port = await AsyncStorage.getItem('port') || '8765';
                const url = `http://${ip}:${port}/api/v0.1/system/bluetooth?deviceId=${encodeURIComponent(authToken)}`;

                const response = await fetch(url, {
                    headers: { 'deviceId': authToken }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setDevices(Array.isArray(data.devices) ? data.devices : []);
                    }
                }
            } catch (error) {
                // Silent fail
            }
        };

        fetchDevices();
        const interval = setInterval(fetchDevices, 2000); // Check every 2s
        cleanup = () => clearInterval(interval);

        return cleanup;
    }, [authToken]);


    // Sort by name
    const sortedDevices = [...devices].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (sortedDevices.length === 0) return null;

    return (
        <View style={styles.wrapper}>
            {sortedDevices.map((device, index) => {
                // Determine battery level (use average or specific)
                const batteryLevel = device.battery && device.battery > -1 ? device.battery : null;
                const hasBattery = batteryLevel !== null;

                const getColor = () => {
                    if (!hasBattery) return theme.colors.secondary;
                    if (batteryLevel! <= 20) return theme.colors.error;
                    return theme.colors.success;
                };

                const iconName = getIconName(device.icon);

                return (
                    <View key={device.macAddress || index} style={styles.container}>
                        <Ionicons name={iconName} size={14} color={theme.colors.textSecondary} />
                        {hasBattery ? (
                            <View style={styles.row}>
                                <Ionicons
                                    name={batteryLevel! > 20 ? "battery-full" : "battery-dead"}
                                    size={14}
                                    color={getColor()}
                                />
                                <Text style={[styles.text, { color: getColor() }]}>
                                    {batteryLevel}%
                                </Text>
                            </View>
                        ) : (
                            <Text style={[styles.text, { color: theme.colors.secondary }]}>
                                {device.name?.substring(0, 10) || 'Device'}
                            </Text>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // Height matching the battery group roughly
        minHeight: 34,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
    },
});
