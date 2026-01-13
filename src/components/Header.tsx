import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BatteryDisplay } from './BatteryDisplay';
import { BluetoothDisplay } from './BluetoothDisplay';
import { WakaTimeDisplay } from './WakaTimeDisplay';
import { StreakDisplay } from './StreakDisplay';
import { GithubStatsDisplay } from './GithubStatsDisplay';

export const Header = ({ onSettingsClick }: { onSettingsClick?: () => void }) => {
    const { isConnected, openFactPopup } = useAppStore();

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? theme.colors.success : theme.colors.error }]} />
                <Text style={[styles.statusText, { color: isConnected ? theme.colors.success : theme.colors.error }]}>
                    {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                <View style={styles.headerItem}>
                    <GithubStatsDisplay />
                    <Text style={styles.headerLabel}>GH STATS</Text>
                </View>

                <View style={styles.headerItem}>
                    <StreakDisplay />
                    <Text style={styles.headerLabel}>GH/LC STREAKS</Text>
                </View>

                <View style={styles.headerItem}>
                    <WakaTimeDisplay />
                    <Text style={styles.headerLabel}>WAKA TIME</Text>
                </View>

                {/* <View style={styles.headerItem}>
                    <SystemCapsule />
                    <Text style={styles.headerLabel}>SYS USAGE</Text>
                </View> */}

                <View style={styles.headerItem}>
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
                    <Text style={styles.headerLabel}>SYS POWER</Text>
                </View>

                <View style={styles.headerItem}>
                    <BluetoothDisplay />
                    <Text style={styles.headerLabel}>BT DEVICES</Text>
                </View>

                <TouchableOpacity onPress={openFactPopup} style={[styles.settingsButton, { alignSelf: 'flex-start' }]}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={theme.colors.warning} />
                </TouchableOpacity>

                {onSettingsClick && (
                    <TouchableOpacity onPress={onSettingsClick} style={[styles.settingsButton, { alignSelf: 'flex-start' }]}>
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
    headerItem: {
        alignItems: 'center',
        gap: 2,
    },
    headerLabel: {
        fontSize: 7,
        color: theme.colors.textDim,
        fontWeight: '700',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    settingsButton: {
        padding: theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
});
