import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { webSocketService } from '../services/WebSocketService';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { TopLangsCard } from './TopLangsCard';

export const QuickActionsCard = () => {
    const { showToast, username } = useAppStore();
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnim = React.useRef(new Animated.Value(0)).current;

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

    const toggleFlip = () => {
        if (isFlipped) {
            Animated.spring(flipAnim, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(flipAnim, {
                toValue: 180,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        }
        setIsFlipped(!isFlipped);
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
    };

    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
    };

    const actions = [
        { id: 'screen_off', label: 'Screen Off', icon: 'moon-outline' as const },
        { id: 'lock', label: 'Lock PC', icon: 'lock-closed-outline' as const },
        { id: 'task_manager', label: 'Task Mgr', icon: 'stats-chart-outline' as const },
        { id: 'screenshot', label: 'Screenshot', icon: 'camera-outline' as const },
        { id: 'upload', label: 'Upload File', icon: 'cloud-upload-outline' as const, action: handleUpload },
    ];

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.cardContainer, frontAnimatedStyle]}
                pointerEvents={isFlipped ? 'none' : 'auto'}
            >
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

                    <TouchableOpacity
                        style={styles.flipBtn}
                        onPress={toggleFlip}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="bar-chart-outline" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>

            <Animated.View
                style={[styles.cardContainer, styles.cardBack, backAnimatedStyle]}
                pointerEvents={isFlipped ? 'auto' : 'none'}
            >
                <LinearGradient
                    colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <TopLangsCard username={username || 'codershubinc'} />

                    <TouchableOpacity
                        style={styles.flipBackBtn}
                        onPress={toggleFlip}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle-outline" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    cardContainer: {
        backfaceVisibility: 'hidden',
        width: '100%',
    },
    cardBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
    flipBackBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        zIndex: 20,
        elevation: 10,
    },
    flipBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        zIndex: 20,
        elevation: 10,
    }
});
