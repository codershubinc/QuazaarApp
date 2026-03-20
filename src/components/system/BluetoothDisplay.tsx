import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { BluetoothDevice } from '../../types';
import { fetcher } from '../helper/Fetcher';

interface BudsIconProps {
    size?: number;
    color?: string;
}

const BudsIcon = ({ size = 24, color = 'currentColor' }: BudsIconProps) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                fill={color}
                fillRule="evenodd"
                d="M5.166 2.25h.047c.266 0 .428 0 .57.007a5.75 5.75 0 0 1 5.46 5.46c.007.142.007.304.007.57V18.75a3 3 0 1 1-6 0V12.3a.25.25 0 0 0-.25-.25A3.75 3.75 0 0 1 1.25 8.3V6.166c0-.153 0-.258.005-.35a3.75 3.75 0 0 1 3.561-3.561c.092-.005.197-.005.35-.005m.021 1.5c-.183 0-.247 0-.297.003A2.25 2.25 0 0 0 2.753 5.89c-.003.05-.003.115-.003.298V8.3A2.25 2.25 0 0 0 5 10.55c.966 0 1.75.784 1.75 1.75v4.95h3V8.313c0-.3 0-.422-.005-.522a4.25 4.25 0 0 0-4.036-4.036c-.1-.005-.222-.005-.521-.005m4.563 15h-3a1.5 1.5 0 0 0 3 0m9.36-14.997a7 7 0 0 0-.297-.003c-.3 0-.422 0-.521.005a4.25 4.25 0 0 0-4.037 4.036c-.005.1-.005.222-.005.521v8.938h3V12.3c0-.966.784-1.75 1.75-1.75a2.25 2.25 0 0 0 2.25-2.25V6.187c0-.183 0-.247-.003-.297a2.25 2.25 0 0 0-2.137-2.137M17.25 18.75h-3a1.5 1.5 0 0 0 3 0m1.584-16.5c.153 0 .258 0 .35.005a3.75 3.75 0 0 1 3.561 3.561c.005.092.005.197.005.35V8.3A3.75 3.75 0 0 1 19 12.05a.25.25 0 0 0-.25.25v6.45a3 3 0 1 1-6 0V8.287c0-.266 0-.428.007-.57a5.75 5.75 0 0 1 5.46-5.46c.142-.007.304-.007.57-.007zM4.5 5.25a.75.75 0 0 1 .75.75v2.5a.75.75 0 1 1-1.5 0V6a.75.75 0 0 1 .75-.75m15 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75"
                clipRule="evenodd"
            />
        </Svg>
    );
};



const isBudsDevice = (deviceName?: string) => {
    const lowerName = (deviceName || '').toLowerCase();

    return (
        lowerName.includes('buds') ||
        lowerName.includes('earbud') ||
        lowerName.includes('airpod')
    );
};

const getIconName = (deviceName?: string, serverIcon?: string): keyof typeof Ionicons.glyphMap => {
    const lowerName = (deviceName || '').toLowerCase();

    // Smart detection based on device name
    // Earbuds/Buds
    if (lowerName.includes('buds') || lowerName.includes('earbud')) return 'bluetooth';
    // AirPods
    if (lowerName.includes('airpod')) return 'bluetooth';
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
                        {isBudsDevice(device.name) ? (
                            <BudsIcon size={16} color={iconColor} />
                        ) : (
                            <Ionicons name={iconName} size={16} color={iconColor} />
                        )}
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
