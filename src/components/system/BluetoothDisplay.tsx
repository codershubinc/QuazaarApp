import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { BluetoothDevice } from '../../types';
import { fetcher } from '../helper/Fetcher';

const getIconName = (deviceName?: string, serverIcon?: string): keyof typeof Ionicons.glyphMap => {
    const lowerName = (deviceName || '').toLowerCase();

    // Smart detection based on device name
    // Earbuds/Buds
    if (lowerName.includes('buds') || lowerName.includes('earbud')) return 'ear-outline';
    // AirPods
    if (lowerName.includes('airpod')) return 'ear-outline';
    // Headphones/Headsets
    if (lowerName.includes('headphone') || lowerName.includes('headset') || lowerName.includes('anc')) return 'headset-outline';
    // Speakers
    if (lowerName.includes('speaker') || lowerName.includes('jbl') || lowerName.includes('bose')) return 'radio-outline';
    // Soundbar
    if (lowerName.includes('soundbar')) return 'tv-outline';

    // Fallback to server icon mapping
    switch (serverIcon) {
        case 'audio-headset': return 'headset-outline';
        case 'audio-headphones': return 'headset-outline';
        case 'phone': return 'phone-portrait';
        case 'computer': return 'desktop';
        case 'input-keyboard': return 'keypad';
        case 'input-mouse': return 'hardware-chip-outline';
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
                const data = await fetcher('/api/v0.1/system/bluetooth');

                if (data && data.success) {
                    setDevices(Array.isArray(data.devices) ? data.devices : []);
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

                const iconName = getIconName(device.name, device.icon);
                const iconColor = device.connected ? theme.colors.secondary : theme.colors.textDim;

                return (
                    <View key={device.macAddress || index} style={styles.container}>
                        <Ionicons name={iconName} size={16} color={"gray"} />
                        {hasBattery ? (
                            <View style={styles.row}>
                                <Ionicons
                                    name={batteryLevel! > 20 ? "battery-full" : "battery-dead"}
                                    size={16}
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
