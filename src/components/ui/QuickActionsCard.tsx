import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { webSocketService } from '../../services/WebSocketService';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

export const QuickActionsCard = () => {
    const { showToast } = useAppStore();

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
        <View style={styles.container}>
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
                            onPress={() => {
                                if (action.action) {
                                    action.action();
                                } else {
                                    webSocketService.sendCommand(action.id);
                                    showToast(`${action.label} sent`, 'info');
                                }
                            }}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 160,
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    actionButton: {
        width: '18%',
        borderWidth: 0,
        aspectRatio: 1,
        borderRadius: theme.borderRadius.m,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
    actionLabel: {
        color: theme.colors.text,
        fontSize: 9,
        marginTop: 2,
        fontWeight: '500',
        textAlign: 'center',
    },
});
