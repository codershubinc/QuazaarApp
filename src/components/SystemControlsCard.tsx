import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const SystemControlsCard = () => {
    const { volumeLevel, isMuted, brightnessLevel } = useAppStore();

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SYSTEM CONTROLS</Text>
                <Ionicons name="settings-outline" size={16} color={theme.colors.textDim} />
            </View>

            {/* Volume Control */}
            <View style={styles.controlRow}>
                <View style={styles.labelContainer}>
                    <Ionicons
                        name={isMuted ? "volume-mute-outline" : "volume-high-outline"}
                        size={20}
                        color={isMuted ? theme.colors.error : theme.colors.textSecondary}
                    />
                    <Text style={styles.label}>Volume</Text>
                </View>
                <View style={styles.sliderContainer}>
                    <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => webSocketService.volumeDecrease()}
                    >
                        <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.sliderBackground}>
                        <LinearGradient
                            colors={isMuted ? [theme.colors.error, theme.colors.error] : [theme.colors.secondary, theme.colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.sliderFill, { width: `${volumeLevel}%` }]}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => webSocketService.volumeIncrease()}
                    >
                        <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => webSocketService.toggleMute()}>
                    <Text style={[styles.valueText, isMuted && { color: theme.colors.error }]}>
                        {isMuted ? 'MUTED' : `${volumeLevel}%`}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Brightness Control */}
            <View style={styles.controlRow}>
                <View style={styles.labelContainer}>
                    <Ionicons name="sunny-outline" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.label}>Brightness</Text>
                </View>
                <View style={styles.sliderContainer}>
                    <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => webSocketService.brightnessDecrease()}
                    >
                        <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.sliderBackground}>
                        <LinearGradient
                            colors={[theme.colors.secondary, theme.colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.sliderFill, { width: `${brightnessLevel}%` }]}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => webSocketService.brightnessIncrease()}
                    >
                        <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.valueText}>{brightnessLevel}%</Text>
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
        marginBottom: theme.spacing.l,
    },
    headerTitle: {
        color: theme.colors.secondary,
        fontWeight: '600',
        letterSpacing: 1.5,
        fontSize: 12,
    },
    controlRow: {
        marginBottom: theme.spacing.m,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginLeft: theme.spacing.s,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
    },
    adjustButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderBackground: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        marginHorizontal: theme.spacing.m,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        borderRadius: 3,
    },
    valueText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.m,
    },
});
