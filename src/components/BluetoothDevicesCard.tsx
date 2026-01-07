import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const BluetoothDevicesCard = () => {
    const { bluetoothDevices } = useAppStore();

    const renderDevice = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => webSocketService.sendCommand('connect_bt', { address: item.macAddress })}
        >
            <View style={styles.deviceIconContainer}>
                <Ionicons name="bluetooth" size={16} color={theme.colors.secondary} />
            </View>
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName} numberOfLines={1}>{item.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceAddress}>{item.macAddress}</Text>
            </View>
            {item.battery !== undefined && (
                <View style={[styles.batteryBadge, {
                    borderColor: item.battery > 20 ? theme.colors.success : theme.colors.error
                }]}>
                    <Ionicons
                        name={item.battery > 20 ? "battery-full" : "battery-dead"}
                        size={10}
                        color={item.battery > 20 ? theme.colors.success : theme.colors.error}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.batteryText, {
                        color: item.battery > 20 ? theme.colors.success : theme.colors.error
                    }]}>{item.battery}%</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>BLUETOOTH</Text>
                <TouchableOpacity
                    onPress={() => webSocketService.sendCommand('scan_bt')}
                    style={styles.refreshButton}
                >
                    <Ionicons name="refresh" size={14} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {bluetoothDevices && bluetoothDevices.length > 0 ? (
                <FlatList
                    data={bluetoothDevices}
                    renderItem={renderDevice}
                    keyExtractor={(item, index) => item.macAddress || index.toString()}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 4 }}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>NO DEVICES</Text>
                </View>
            )}
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
        maxHeight: 200, // Limit height
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
        letterSpacing: 2,
        fontSize: 10,
    },
    refreshButton: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: theme.borderRadius.s,
    },
    list: {
        flexGrow: 0,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: theme.borderRadius.s,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    deviceIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.s,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: '500',
    },
    deviceAddress: {
        color: theme.colors.textDim,
        fontSize: 8,
        fontFamily: 'monospace',
    },
    batteryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    batteryText: {
        fontSize: 9,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    emptyState: {
        paddingVertical: theme.spacing.m,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textDim,
        fontSize: 10,
        letterSpacing: 1,
    },
});
