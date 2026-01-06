import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundDevice {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

export const SystemOutputCard = () => {
    const { wifiInfo, commandOutput, authToken } = useAppStore();
    const [soundDevices, setSoundDevices] = useState<SoundDevice[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSoundDevices = async () => {
        if (!authToken) return;
        try {
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';
            const headers = { 'deviceId': authToken };
            const query = `?deviceId=${encodeURIComponent(authToken)}`;

            const response = await fetch(`http://${ip}:${port}/api/v0.1/system/sound/devices${query}`, { headers });
            const data = await response.json();

            if (data.success && Array.isArray(data.devices)) {
                setSoundDevices(data.devices);
            }
        } catch (error) {
            console.log("Error fetching sound devices", error);
        }
    };

    const setSoundOutput = async (deviceName: string) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';
            const headers = {
                'deviceId': authToken,
                'Content-Type': 'application/json'
            };
            const query = `?deviceId=${encodeURIComponent(authToken)}`;

            await fetch(`http://${ip}:${port}/api/v0.1/system/sound/device${query}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ deviceName })
            });

            // Refresh list immediately
            setTimeout(fetchSoundDevices, 500);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoundDevices();
        const interval = setInterval(fetchSoundDevices, 5000);
        return () => clearInterval(interval);
    }, [authToken]);

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SYSTEM OUTPUT</Text>
                <Ionicons name="hardware-chip-outline" size={16} color={theme.colors.textDim} />
            </View>

            <View style={styles.topSection}>
                <View style={styles.infoRow}>
                    <Ionicons name="wifi" size={14} color={theme.colors.secondary} />
                    <Text style={styles.infoLabel}>Net:</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {wifiInfo?.ssid || 'Disconnected'}
                    </Text>
                </View>

                {wifiInfo?.ipAddress && (
                    <View style={styles.infoRow}>
                        <Ionicons name="globe-outline" size={14} color={theme.colors.secondary} />
                        <Text style={styles.infoLabel}>IP:</Text>
                        <Text style={styles.infoValue}>{wifiInfo.ipAddress}</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { fontSize: 10 }]}>AUDIO OUTPUT</Text>
                {loading && <ActivityIndicator size="small" color={theme.colors.secondary} />}
            </View>

            <ScrollView style={styles.deviceList} nestedScrollEnabled>
                {soundDevices.map((device) => (
                    <TouchableOpacity
                        key={device.id}
                        style={[
                            styles.deviceItem,
                            device.active && styles.activeDeviceItem
                        ]}
                        onPress={() => !device.active && setSoundOutput(device.name)}
                        disabled={loading || device.active}
                    >
                        <Ionicons
                            name={device.active ? "volume-high" : "radio-button-off"}
                            size={14}
                            color={device.active ? theme.colors.success : theme.colors.textDim}
                        />
                        <Text
                            style={[
                                styles.deviceName,
                                device.active && styles.activeDeviceName
                            ]}
                            numberOfLines={1}
                        >
                            {device.description || device.name}
                        </Text>
                        {device.active && (
                            <View style={styles.activeDot} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        maxHeight: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    headerTitle: {
        color: theme.colors.secondary,
        fontWeight: '600',
        letterSpacing: 1.5,
        fontSize: 12,
    },
    topSection: {
        marginBottom: theme.spacing.s,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        color: theme.colors.textSecondary,
        marginLeft: 6,
        marginRight: 6,
        fontSize: 12,
    },
    infoValue: {
        color: theme.colors.text,
        fontWeight: '500',
        fontSize: 12,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.s,
        opacity: 0.5,
    },
    deviceList: {
        maxHeight: 150,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: theme.borderRadius.m,
        marginBottom: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    activeDeviceItem: {
        backgroundColor: 'rgba(52, 211, 153, 0.1)', // theme.colors.success with opacity
        borderColor: 'rgba(52, 211, 153, 0.3)',
        borderWidth: 1,
    },
    deviceName: {
        color: theme.colors.textDim,
        fontSize: 11,
        marginLeft: 8,
        flex: 1,
    },
    activeDeviceName: {
        color: theme.colors.success,
        fontWeight: '600',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.success,
    },
});
