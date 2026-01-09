import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

interface BatteryDisplayProps {
    type: 'remote' | 'local';
    iconName: keyof typeof Ionicons.glyphMap;
}

export const BatteryDisplay = ({ type, iconName }: BatteryDisplayProps) => {
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean }>({
        level: 0,
        charging: false
    });
    const { authToken } = useAppStore();

    // Fetching Logic
    useEffect(() => {
        let cleanup = () => { };

        const setupLocalBattery = async () => {
            const fetchBattery = async () => {
                try {
                    const [level, state] = await Promise.all([
                        Battery.getBatteryLevelAsync(),
                        Battery.getBatteryStateAsync(),
                    ]);
                    let isCharging = state === Battery.BatteryState.CHARGING;
                    if (isCharging && Battery.BatteryState.FULL) {
                        isCharging = false;  // Consider FULL as not charging for our UI purposes
                    }
                    setBatteryInfo({
                        level: Math.round(level * 100),
                        charging: isCharging
                    });
                } catch (e) {
                    console.error("Local battery error:", e);
                }
            };

            fetchBattery(); // Initial fetch

            const levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
                setBatteryInfo(prev => ({ ...prev, level: Math.round(batteryLevel * 100) }));
            });

            const stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
                setBatteryInfo(prev => ({ ...prev, charging: batteryState === Battery.BatteryState.CHARGING }));
            });

            // Poll every 1 second to ensure live updates on Android where listeners might be lazy
            const interval = setInterval(fetchBattery, 5000);

            cleanup = () => {
                levelSub.remove();
                stateSub.remove();
                clearInterval(interval);
            };
        };


        const setupRemoteBattery = () => {
            const fetchBattery = async () => {
                if (!authToken) return;
                try {
                    const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
                    const port = await AsyncStorage.getItem('port') || '8765';
                    let url = `http://${ip}:${port}/api/v0.1/system/battery`;

                    const headers: HeadersInit = { 'deviceId': authToken };
                    url += `?deviceId=${encodeURIComponent(authToken)}`;

                    const response = await fetch(url, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        setBatteryInfo({
                            level: Math.round(data.percentage),
                            charging: data.state === 'charging' || data.state === 'PluggedIn' // Safe broad check? MainScreen used 'charging'
                        });
                    }
                } catch (error) {
                    // console.error('Failed to fetch battery data', error);
                }
            };

            fetchBattery(); // Initial fetch
            const interval = setInterval(fetchBattery, 1000);
            cleanup = () => clearInterval(interval);
        };

        if (type === 'local') {
            setupLocalBattery();
        } else {
            setupRemoteBattery();
        }

        return () => cleanup();
    }, [type, authToken]);

    const { level: percentage, charging: isCharging } = batteryInfo;
    const prevIsCharging = useRef(isCharging);

    useEffect(() => {
        let currentAnimation: Animated.CompositeAnimation | null = null;

        // Always reset on state change to ensure clean start
        opacityAnim.setValue(1);
        scaleAnim.setValue(1);
        shakeAnim.setValue(0);

        const wasCharging = prevIsCharging.current;
        prevIsCharging.current = isCharging;

        if (isCharging) {
            // Check if this is a new "plugged in" event
            if (!wasCharging) {
                // 1. Definition of Shake Animation (0 -> 1 -> -1 -> 0)
                const shakeSequence = Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]);

                // 2. Definition of Scale Up/Down
                // Scale up holds a bit longer while shaking
                const scaleSequence = Animated.sequence([
                    Animated.spring(scaleAnim, { toValue: 1.4, friction: 3, useNativeDriver: true }),
                    Animated.delay(400),
                    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true })
                ]);

                // 3. Combine Shake + Scale for "Energy" entrance
                const energyEntrance = Animated.parallel([
                    shakeSequence,
                    scaleSequence
                ]);

                // 4. Define Calm Pulse loop
                const calmPulse = Animated.loop(
                    Animated.sequence([
                        Animated.timing(opacityAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
                        Animated.timing(opacityAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    ])
                );

                // Execute: Entrance -> Pulse
                currentAnimation = Animated.sequence([
                    energyEntrance,
                    calmPulse // Note: sequence waits for previous to finish. loop doesn't "finish" but start() can be chained differently if needed.
                    // However, Animated.sequence with a loop at the end works fine, it just never returns.
                ]);

                currentAnimation.start();
            } else {
                // Already charging (e.g. app open or props update) -> Just pulse
                const calmPulse = Animated.loop(
                    Animated.sequence([
                        Animated.timing(opacityAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
                        Animated.timing(opacityAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    ])
                );
                currentAnimation = calmPulse;
                currentAnimation.start();
            }
        }

        return () => {
            if (currentAnimation) {
                currentAnimation.stop();
            }
        };
    }, [isCharging]);

    const getBatteryIcon = () => {
        if (isCharging) return 'battery-charging';
        if (percentage >= 90) return 'battery-full';
        if (percentage >= 50) return 'battery-half';
        return 'battery-dead';
    };

    const getColor = () => {
        if (isCharging) return theme.colors.success;
        if (percentage <= 20) return theme.colors.error;
        if (percentage <= 50) return theme.colors.warning;
        return theme.colors.success;
    };

    // Interpolate standard 0-1 range to rotation degrees
    const spin = shakeAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-15deg', '15deg']
    });

    return (
        <View style={styles.batteryWrapper}>
            <View style={{ width: 16 }}>
                <Ionicons name={iconName} size={14} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.batteryContainer}>
                <Animated.View style={{
                    opacity: opacityAnim,
                    transform: [
                        { scale: scaleAnim },
                        { rotate: spin }
                    ]
                }}>
                    <Ionicons name={getBatteryIcon()} size={18} color={getColor()} />
                </Animated.View>
                <Text style={[styles.batteryText, { color: getColor() }]}>
                    {Math.round(percentage)}%
                </Text>
            </View>
            {type === 'local' && (
                <View style={{ width: 4 }} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    batteryWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 24, // Fixed height to keep it compact
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2, // Very low spacing
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    batteryText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
});
