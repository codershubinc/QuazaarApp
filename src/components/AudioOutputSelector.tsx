import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundDevice {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

const getDeviceIcon = (name: string, desc: string): keyof typeof Ionicons.glyphMap => {
    const lower = (name + desc).toLowerCase();
    if (lower.includes('headphone') || lower.includes('headset')) return 'headset';
    if (lower.includes('hdmi') || lower.includes('displayport')) return 'tv-outline';
    if (lower.includes('bluetooth') || lower.includes('bluez')) return 'bluetooth';
    return 'volume-high';
};

export const AudioOutputSelector = () => {
    const { authToken } = useAppStore();
    const [soundDevices, setSoundDevices] = useState<SoundDevice[]>([]);
    const [loadingDevice, setLoadingDevice] = useState(false);

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
            // Silent error
        }
    };

    const setSoundOutput = async (deviceName: string) => {
        if (!authToken) return;
        setLoadingDevice(true);
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
            
            setTimeout(fetchSoundDevices, 500);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDevice(false);
        }
    };

    useEffect(() => {
        fetchSoundDevices();
        const interval = setInterval(fetchSoundDevices, 5000);
        return () => clearInterval(interval);
    }, [authToken]);

    if (soundDevices.length === 0) return null;

    return (
        <View style={styles.deviceContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.deviceScroll}
            >
                {soundDevices.map((device) => (
                    <TouchableOpacity
                        key={device.id}
                        style={[
                            styles.deviceButton,
                            device.active && styles.deviceButtonActive
                        ]}
                        onPress={() => !device.active && setSoundOutput(device.name)}
                        disabled={loadingDevice || device.active}
                    >
                        <Ionicons 
                            name={getDeviceIcon(device.name, device.description)} 
                            size={14} 
                            color={device.active ? theme.colors.success : theme.colors.textDim} 
                        />
                        {device.active && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    deviceContainer: {
        width: '100%',
        marginVertical: 4,
        paddingLeft: 28, // Align with slider start roughly (icon width + margin)
    },
    deviceScroll: {
        gap: 8,
        paddingRight: 16,
    },
    deviceButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    deviceButtonActive: {
        borderColor: theme.colors.success,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -2,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.success,
    },
});
