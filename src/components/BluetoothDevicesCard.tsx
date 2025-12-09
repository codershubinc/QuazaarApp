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
                <Ionicons name="bluetooth" size={20} color={theme.colors.secondary} />
            </View>
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName} numberOfLines={1}>{item.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceAddress}>{item.macAddress}</Text>
            </View>
            {item.battery !== undefined && (
                <View style={styles.batteryBadge}>
                    <Ionicons name="battery-half" size={12} color={theme.colors.background} style={{ marginRight: 4 }} />
                    <Text style={styles.batteryText}>{item.battery}%</Text>
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
                <Text style={styles.headerTitle}>BLUETOOTH DEVICES</Text>
                <TouchableOpacity onPress={() => webSocketService.sendCommand('scan_bt')}>
                    <Ionicons name="refresh" size={18} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {bluetoothDevices && bluetoothDevices.length > 0 ? (
                <FlatList
                    data={bluetoothDevices}
                    renderItem={renderDevice}
                    keyExtractor={(item, index) => item.macAddress || index.toString()}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="bluetooth-outline" size={48} color={theme.colors.textDim} />
                    <Text style={styles.emptyText}>No devices found</Text>
                </View>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flex: 1,
        minHeight: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    headerTitle: {
        color: theme.colors.secondary,
        fontWeight: '600',
        letterSpacing: 1.5,
        fontSize: 12,
    },
    list: {
        flex: 1,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    deviceIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    deviceAddress: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontFamily: 'monospace',
    },
    batteryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: theme.spacing.s,
    },
    batteryText: {
        color: theme.colors.background,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyText: {
        color: theme.colors.textDim,
        marginTop: theme.spacing.m,
        fontSize: 14,
    },
});
