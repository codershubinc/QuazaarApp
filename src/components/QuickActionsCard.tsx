import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { webSocketService } from '../services/WebSocketService';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const QuickActionsCard = () => {
    async function handleUpload() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;
            console.log('File picked:', result.assets[0].uri);
            // TODO: Implement file upload logic in WebSocketService
        } catch (err) {
            console.error('Error picking file:', err);
        }
    }

    const actions = [
        { id: 'screen_off', label: 'Screen Off', icon: 'moon-outline' as const },
        { id: 'lock', label: 'Lock PC', icon: 'lock-closed-outline' as const },
        { id: 'task_manager', label: 'Task Mgr', icon: 'stats-chart-outline' as const },
        { id: 'screenshot', label: 'Screenshot', icon: 'camera-outline' as const },
        { id: 'upload', label: 'Upload File', icon: 'cloud-upload-outline' as const, action: handleUpload },
    ];

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.grid}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionButton}
                        onPress={() => action.action ? action.action() : webSocketService.sendCommand(action.id)}
                    >
                        <LinearGradient
                            colors={[theme.colors.surfaceHighlight, 'rgba(255,255,255,0.05)']}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name={action.icon} size={20} color={theme.colors.secondary} />
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
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
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '18%',
        aspectRatio: 1,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.small,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
    actionLabel: {
        color: theme.colors.text,
        fontSize: 8,
        marginTop: 2,
        fontWeight: '500',
        textAlign: 'center',
    },
});
