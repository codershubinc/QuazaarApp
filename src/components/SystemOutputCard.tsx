import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const SystemOutputCard = () => {
    const { wifiInfo, commandOutput } = useAppStore();

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SYSTEM OUTPUT</Text>
                <Ionicons name="terminal-outline" size={16} color={theme.colors.textDim} />
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Ionicons name="wifi" size={16} color={theme.colors.secondary} />
                    <Text style={styles.infoLabel}>Network:</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {wifiInfo?.SSID || 'Not Connected'}
                    </Text>
                </View>

                {wifiInfo?.IP && (
                    <View style={styles.infoRow}>
                        <Ionicons name="globe-outline" size={16} color={theme.colors.secondary} />
                        <Text style={styles.infoLabel}>IP Address:</Text>
                        <Text style={styles.infoValue}>{wifiInfo.IP}</Text>
                    </View>
                )}
            </View>

            <View style={styles.consoleContainer}>
                <Text style={styles.consoleText}>
                    {commandOutput || '> System ready...'}
                </Text>
            </View>
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
    infoContainer: {
        marginBottom: theme.spacing.m,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    infoLabel: {
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.s,
        marginRight: theme.spacing.s,
        fontSize: 14,
    },
    infoValue: {
        color: theme.colors.text,
        fontWeight: '500',
        fontSize: 14,
        flex: 1,
    },
    consoleContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        minHeight: 80,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    consoleText: {
        color: theme.colors.success,
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
