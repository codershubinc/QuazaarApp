import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { theme } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BatteryDisplay } from '../system/BatteryDisplay';
import { BluetoothDisplay } from '../system/BluetoothDisplay';
import { WakaTimeDisplay } from '../developer/WakaTimeDisplay';
import { StreakDisplay } from '../productivity/StreakDisplay';
import { GithubStatsDisplay } from '../developer/GithubStatsDisplay';
import { SpotifyController } from '../media/SpotifyController';

export const Header = ({ onSettingsClick }: { onSettingsClick?: () => void }) => {
    const { isConnected, openFactPopup } = useAppStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

    const menuItems = [
        {
            id: 'fact',
            label: 'Daily Fact',
            icon: 'lightbulb-on-outline' as const,
            iconLib: 'mci' as const,
            color: theme.colors.warning,
            onPress: () => { setMenuOpen(false); openFactPopup(); },
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: 'settings-sharp' as const,
            iconLib: 'ion' as const,
            color: theme.colors.text,
            onPress: () => { setMenuOpen(false); onSettingsClick?.(); },
        },
    ];

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

                {/* Hamburger Menu Button */}
                <TouchableOpacity
                    style={[styles.settingsButton, { alignSelf: 'flex-start' }]}
                    onPress={(e) => {
                        const { pageX, pageY } = e.nativeEvent;
                        setMenuAnchor({ x: pageX, y: pageY });
                        setMenuOpen(true);
                    }}
                >
                    <Ionicons name="menu" size={22} color={theme.colors.text} />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                <Modal
                    transparent
                    visible={menuOpen}
                    animationType="fade"
                    onRequestClose={() => setMenuOpen(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
                        <View style={styles.menuOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.menuContainer, { top: menuAnchor.y + 8, right: 16 }]}>
                                    {menuItems.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.menuItem,
                                                styles.menuItemBorder,
                                            ]}
                                            onPress={item.onPress}
                                            activeOpacity={0.7}
                                        >
                                            {item.iconLib === 'mci' ? (
                                                <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                                            ) : (
                                                <Ionicons name={item.icon as any} size={16} color={item.color} />
                                            )}
                                            <Text style={[styles.menuItemText, { color: item.color }]}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <View style={styles.menuSpotify}>
                                        <SpotifyController />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
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
    menuOverlay: {
        flex: 1,
    },
    menuContainer: {
        position: 'absolute',
        minWidth: 160,
        backgroundColor: 'rgba(10, 10, 20, 0.97)',
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
    },
    menuItemText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    menuSpotify: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
});
