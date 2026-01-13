import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { FlipClock } from './FlipClock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- SVG Circular Progress Component ---
const SvgCircularProgress = ({
    size,
    width,
    fill,
    color,
    backgroundColor,
    children
}: {
    size: number;
    width: number;
    fill: number;
    color: string;
    backgroundColor: string;
    children?: React.ReactNode;
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    const radius = (size - width) / 2;
    const circumference = 2 * Math.PI * radius;
    const halfSize = size / 2;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: fill,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [fill]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${halfSize}, ${halfSize}`}>
                    <Circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={backgroundColor}
                        strokeWidth={width}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={color}
                        strokeWidth={width}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </G>
            </Svg>
            <View style={StyleSheet.absoluteFillObject}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {children}
                </View>
            </View>
        </View>
    );
};

// --- Main Card ---
export const DateTimeCard = () => {
    const [date, setDate] = useState(new Date());
    const [usage, setUsage] = useState({
        cpu: 0, ram: 0, ramUsed: 0, ramTotal: 0,
        gpu: 0, vram: 0, vramUsed: 0, vramTotal: 0,
        storagePercent: 0, storageUsed: 0, storageTotal: 0
    });
    const { authToken } = useAppStore();

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);

        const fetchUsage = async () => {
            try {
                if (!authToken) return;
                const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
                const port = await AsyncStorage.getItem('port') || '8765';
                const query = `?deviceId=${encodeURIComponent(authToken)}`;

                // Parallel Fetch for efficiency
                const [usageRes, storageRes] = await Promise.all([
                    fetch(`http://${ip}:${port}/api/v0.1/system/usage${query}`),
                    fetch(`http://${ip}:${port}/api/v0.1/system/storage${query}`)
                ]);

                const usageData = await usageRes.json();
                const storageData = await storageRes.json();

                let newUsage = { ...usage };

                if (usageData.success && usageData.usage) {
                    newUsage = {
                        ...newUsage,
                        cpu: usageData.usage.cpu_usage || 0,
                        ram: usageData.usage.memory_usage || 0,
                        ramUsed: usageData.usage.memory_used || 0,
                        ramTotal: usageData.usage.memory_total || 0,
                        gpu: usageData.usage.gpu_usage || 0,
                        vram: usageData.usage.gpu_memory || 0,
                        vramUsed: usageData.usage.gpu_memory_used || 0,
                        vramTotal: usageData.usage.gpu_memory_total || 0,
                    };
                }

                if (storageData.success && storageData.storage) {
                    newUsage = {
                        ...newUsage,
                        storagePercent: storageData.storage.used_percent || 0,
                        storageUsed: storageData.storage.used || 0,
                        storageTotal: storageData.storage.total || 0,
                    };
                }

                setUsage(newUsage);
            } catch (error) {
                // Ignore errors (dashboard resilience)
            }
        };

        fetchUsage();
        const usageTimer = setInterval(fetchUsage, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(usageTimer);
        };
    }, [authToken]);

    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });

    const formatSize = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>

                {/* LEFT: Date */}
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.secondary} />
                    <Text style={styles.dateText}>{dateString}</Text>
                </View>

                {/* MIDDLE: Stats & Storage */}
                <View style={styles.centerSection}>
                    <View style={styles.statsContainer}>
                        {/* CPU Ring */}
                        <SvgCircularProgress
                            size={75}
                            width={5}
                            fill={usage.cpu}
                            color={theme.colors.secondary}
                            backgroundColor="rgba(255,255,255,0.05)"
                        >
                            <View style={styles.statInner}>
                                <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
                                    CPU {Math.round(usage.cpu)}%
                                </Text>
                                <Text style={styles.statValue}>{formatSize(usage.ramUsed)} G</Text>
                                <Text style={styles.statSub}>RAM</Text>
                            </View>
                        </SvgCircularProgress>

                        {/* GPU Ring */}
                        <SvgCircularProgress
                            size={75}
                            width={5}
                            fill={usage.gpu}
                            color={theme.colors.primary}
                            backgroundColor="rgba(255,255,255,0.05)"
                        >
                            <View style={styles.statInner}>
                                <Text style={[styles.statLabel, { color: theme.colors.primary }]}>
                                    GPU {Math.round(usage.gpu)}%
                                </Text>
                                <Text style={styles.statValue}>{formatSize(usage.vramUsed)} G</Text>
                                <Text style={styles.statSub}>VRAM</Text>
                            </View>
                        </SvgCircularProgress>
                    </View>

                    {/* Storage Status Line */}
                    {usage.storageTotal > 0 && (
                        <View style={styles.storageContainer}>
                            <Text style={styles.storageText}>
                                <Text style={{ color: theme.colors.warning }}>STORAGE </Text>
                                {Math.round(usage.storagePercent)}% • {formatSize(usage.storageTotal - usage.storageUsed)}G FREE of {formatSize(usage.storageTotal)}G
                            </Text>
                        </View>
                    )}
                </View>

                {/* RIGHT: Clock */}
                <View style={styles.rightContainer}>
                    <FlipClock />
                </View>
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
        flex: 1,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: 80,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6, // Space between rings and storage text
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
        justifyContent: 'flex-end',
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    // Ring Inner Text
    statInner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
    },
    statLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        marginBottom: 1,
        opacity: 0.9,
    },
    statValue: {
        fontSize: 11,
        color: theme.colors.text,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    statSub: {
        fontSize: 7,
        color: theme.colors.textDim,
    },
    // Storage Styles
    storageContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    storageText: {
        fontSize: 9,
        color: theme.colors.textDim,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: 'monospace',
    }
});