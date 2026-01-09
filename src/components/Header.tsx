import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BatteryDisplay } from './BatteryDisplay';
import { BluetoothDisplay } from './BluetoothDisplay';
import { WakaTimeDisplay } from './WakaTimeDisplay';

export const Header = ({ onSettingsClick }: { onSettingsClick?: () => void }) => {
    const { isConnected } = useAppStore();

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? theme.colors.success : theme.colors.error }]} />
                <Text style={[styles.statusText, { color: isConnected ? theme.colors.success : theme.colors.error }]}>
                    {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                <WakaTimeDisplay />
                <View style={styles.batteryGroup}>
                    <BatteryDisplay
                        type="remote"
                        iconName="desktop-outline"
                    />
                    <View style={styles.batteryDivider} />
                    <BatteryDisplay
                        type="local"
                        iconName="tablet-portrait-outline"
                    />
                </View>
                <BluetoothDisplay />

                {onSettingsClick && (
                    <TouchableOpacity onPress={onSettingsClick} style={styles.settingsButton}>
                        <Ionicons name="settings-sharp" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        backgroundColor: 'transparent',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.s,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    batteryGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    batteryDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    settingsButton: {
        padding: theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
});
