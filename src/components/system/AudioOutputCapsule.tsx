import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetcher } from '../helper/Fetcher';

interface SoundDevice {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

const getDeviceIcon = (name: string, desc: string): keyof typeof Ionicons.glyphMap => {
    const lowerName = name.toLowerCase();
    const lowerDesc = desc.toLowerCase();
    const combined = lowerName + ' ' + lowerDesc;
    
    // Specific Bluetooth device types
    if (lowerName.includes('bluez') || combined.includes('bluetooth')) {
        // Earbuds/Buds
        if (lowerDesc.includes('buds') || lowerDesc.includes('earbud')) return 'ear-outline';
        // AirPods
        if (lowerDesc.includes('airpod')) return 'ear-outline';
        // Headphones/Headsets
        if (lowerDesc.includes('headphone') || lowerDesc.includes('headset')) return 'headset-outline';
        // Speakers
        if (lowerDesc.includes('speaker') || lowerDesc.includes('jbl') || lowerDesc.includes('bose')) return 'radio-outline';
        // Soundbar
        if (lowerDesc.includes('soundbar')) return 'tv-outline';
        // Generic Bluetooth
        return 'bluetooth';
    }
    
    // Wired devices
    if (combined.includes('headphone') || combined.includes('headset')) return 'headset-outline';
    if (combined.includes('hdmi') || combined.includes('displayport')) return 'tv-outline';
    if (combined.includes('speaker')) return 'volume-high-outline';
    
    return 'volume-high-outline';
};

const getShortDeviceName = (name: string, desc: string): string => {
    // Use description for better naming, fallback to name
    const displayName = desc || name;
    const lower = displayName.toLowerCase();
    
    // Extract meaningful short name from device names
    if (lower.includes('headphone') || lower.includes('headset')) return 'HPH';
    if (lower.includes('hdmi')) return 'HDMI';
    if (lower.includes('speaker')) return 'SPK';
    if (lower.includes('analog')) return 'AUX';
    
    // Bluetooth devices - use description to create meaningful abbreviation
    if (name.toLowerCase().includes('bluez') || name.toLowerCase().includes('bluetooth')) {
        // Try to extract brand/model abbreviation from description
        // Examples:
        // "Swapnil's Galaxy Buds FE" -> "BUDS"
        // "NIRVANAA 751ANC" -> "NIRV"
        // "JBL Flip 5" -> "JBL"
        
        const words = displayName.split(/\s+/);
        
        // Look for known audio brands/keywords
        if (lower.includes('galaxy') && lower.includes('buds')) return 'BUDS';
        if (lower.includes('airpods')) return 'APOD';
        if (lower.includes('jbl')) return 'JBL';
        if (lower.includes('sony')) return 'SONY';
        if (lower.includes('bose')) return 'BOSE';
        if (lower.includes('beats')) return 'BEAT';
        if (lower.includes('sennheiser')) return 'SENH';
        
        // Use first meaningful word (not possessive/articles)
        for (const word of words) {
            if (word.length >= 3 && !word.endsWith("'s")) {
                return word.substring(0, 4).toUpperCase();
            }
        }
    }
    
    // Default: take first 3-4 chars uppercase from description
    return displayName.substring(0, 4).toUpperCase();
};

export const AudioOutputCapsule: React.FC = () => {
    const { authToken } = useAppStore();
    const [soundDevices, setSoundDevices] = useState<SoundDevice[]>([]);
    const [loadingDevice, setLoadingDevice] = useState<string | null>(null);

    const CONTAINER_HEIGHT = 160;

    const fetchSoundDevices = async () => {
        if (!authToken) return;
        try {
            const data = await fetcher('/api/v0.1/system/sound/devices');

            if (data.success && Array.isArray(data.devices)) {
                setSoundDevices(data.devices);
            }
        } catch (error) {
            console.error('Failed to fetch sound devices', error);
        }
    };

    const setSoundOutput = async (deviceName: string) => {
        if (!authToken || loadingDevice) return;
        setLoadingDevice(deviceName);
        try {
            await fetcher('/api/v0.1/system/sound/device', {
                method: 'POST',
                body: JSON.stringify({ deviceName })
            });

            setTimeout(fetchSoundDevices, 500);
        } catch (error) {
            console.error('Failed to set sound output', error);
        } finally {
            setLoadingDevice(null);
        }
    };

    useEffect(() => {
        fetchSoundDevices();
        const interval = setInterval(fetchSoundDevices, 10000);
        return () => clearInterval(interval);
    }, [authToken]);

    if (soundDevices.length === 0) {
        return null;
    }

    return (
        <View style={[styles.capsuleContainer, { height: CONTAINER_HEIGHT }]}>
            {/* Devices List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {soundDevices.map((device) => {
                    const deviceIcon = getDeviceIcon(device.name, device.description);
                    const shortName = getShortDeviceName(device.name, device.description);
                    const isLoading = loadingDevice === device.name;

                    return (
                        <TouchableOpacity
                            key={device.id}
                            style={[
                                styles.deviceItem,
                                device.active && styles.deviceItemActive
                            ]}
                            onPress={() => !device.active && setSoundOutput(device.name)}
                            disabled={!!loadingDevice || device.active}
                            activeOpacity={0.7}
                        >
                            {/* Icon */}
                            <Ionicons
                                name={deviceIcon}
                                size={16}
                                color={device.active ? theme.colors.secondary : theme.colors.textDim}
                            />

                            {/* Device Short Name */}
                            <Text
                                style={[
                                    styles.deviceItemText,
                                    device.active && styles.deviceItemTextActive
                                ]}
                                numberOfLines={2}
                            >
                                {shortName}
                            </Text>

                            {/* Active Indicator */}
                            {device.active && (
                                <View style={styles.activeIndicator} />
                            )}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <View style={styles.loadingIndicator}>
                                    <Ionicons name="sync" size={10} color={theme.colors.textDim} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    capsuleContainer: {
        width: 70,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 8,
        gap: 4,
        alignItems: 'center',
    },
    deviceItem: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 6,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        position: 'relative',
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    deviceItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    deviceItemText: {
        fontSize: 9,
        fontWeight: '600',
        fontFamily: 'monospace',
        color: theme.colors.textDim,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    deviceItemTextActive: {
        color: theme.colors.secondary,
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -2 }],
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.secondary,
    },
    loadingIndicator: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
});
