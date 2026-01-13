import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import Svg, { Circle, G } from 'react-native-svg';
import { fetcher } from './helper/Fetcher';

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

export const SystemStatsCard = () => {
    const [usage, setUsage] = useState({
        cpu: 0, ram: 0, ramUsed: 0, ramTotal: 0,
        gpu: 0, vram: 0, vramUsed: 0, vramTotal: 0,
        storagePercent: 0, storageUsed: 0, storageTotal: 0,
        cpuTemp: 0, wattage: 0, gpuWattage: 0,
    });
    const { authToken } = useAppStore();

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                if (!authToken) return;

                const [usageData, storageData] = await Promise.all([
                    fetcher('/api/v0.1/system/usage'),
                    fetcher('/api/v0.1/system/storage')
                ]);

                let newUsage = { ...usage };

                if (usageData && usageData.success && usageData.usage) {
                    newUsage = {
                        ...newUsage,
                        cpu: usageData.usage.cpu_usage || 0,
                        cpuTemp: usageData.usage.cpu_temp || 0,
                        ram: usageData.usage.memory_usage || 0,
                        ramUsed: usageData.usage.memory_used || 0,
                        ramTotal: usageData.usage.memory_total || 0,
                        gpu: usageData.usage.gpu_usage || 0,
                        vram: usageData.usage.gpu_memory || 0,
                        vramUsed: usageData.usage.gpu_memory_used || 0,
                        vramTotal: usageData.usage.gpu_memory_total || 0,
                        wattage: usageData.usage.wattage || 0,
                        gpuWattage: usageData.usage.gpu_wattage || 0,
                    };
                }

                if (storageData && storageData.success && storageData.storage) {
                    newUsage = {
                        ...newUsage,
                        storagePercent: storageData.storage.used_percent || 0,
                        storageUsed: storageData.storage.used || 0,
                        storageTotal: storageData.storage.total || 0,
                    };
                }

                setUsage(newUsage);
            } catch (error) {
                // Fail silently
            }
        };

        fetchUsage();
        const usageTimer = setInterval(fetchUsage, 2000);

        return () => {
            clearInterval(usageTimer);
        };
    }, [authToken]);

    const formatSize = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>
                <View style={styles.centerSection}>
                    <View style={styles.statsContainer}>
                        {/* CPU Ring */}
                        <SvgCircularProgress
                            size={85}
                            width={6}
                            fill={usage.cpu}
                            color={theme.colors.secondary}
                            backgroundColor="rgba(255,255,255,0.05)"
                        >
                            <View style={styles.statInner}>
                                <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>CPU</Text>
                                <Text style={styles.statValue}>{Math.round(usage.cpu)}%</Text>
                                {usage.cpuTemp > 0 && (
                                    <Text style={styles.statSub}>{Math.round(usage.cpuTemp)}°C</Text>
                                )}
                            </View>
                        </SvgCircularProgress>

                        {/* RAM Ring */}
                        <SvgCircularProgress
                            size={85}
                            width={6}
                            fill={usage.ram}
                            color={theme.colors.accent}
                            backgroundColor="rgba(255,255,255,0.05)"
                        >
                            <View style={styles.statInner}>
                                <Text style={[styles.statLabel, { color: theme.colors.accent }]}>RAM</Text>
                                <Text style={styles.statValue}>{Math.round(usage.ram)}%</Text>
                                <Text style={styles.statSub}>{formatSize(usage.ramUsed)}/{formatSize(usage.ramTotal)} G</Text>
                            </View>
                        </SvgCircularProgress>

                        {/* GPU Ring */}
                        <SvgCircularProgress
                            size={85}
                            width={6}
                            fill={usage.gpu}
                            color={theme.colors.primary}
                            backgroundColor="rgba(255,255,255,0.05)"
                        >
                            <View style={styles.statInner}>
                                <Text style={[styles.statLabel, { color: theme.colors.primary }]}>GPU</Text>
                                <Text style={styles.statValue}>{Math.round(usage.gpu)}%</Text>
                                <Text style={styles.statSub}>
                                    {formatSize(usage.vramUsed)}G
                                    {usage.gpuWattage > 0 ? ` ${Math.round(usage.gpuWattage)}W` : ''}
                                </Text>
                            </View>
                        </SvgCircularProgress>
                    </View>

                    {/* Storage & Wattage Status Line */}
                    {(usage.storageTotal > 0 || usage.wattage > 0) && (
                        <View style={styles.storageContainer}>
                            <Text style={styles.storageText}>
                                <Text style={{ color: theme.colors.warning }}>STORAGE </Text>
                                {Math.round(usage.storagePercent)}% • {formatSize(usage.storageTotal - usage.storageUsed)}G FREE
                                {usage.wattage > 0 && (
                                    <Text style={{ color: theme.colors.success }}> • ⚡ {Math.round(usage.wattage)}W</Text>
                                )}
                            </Text>
                        </View>
                    )}
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
        minHeight: 140, // Ensure height for centering
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 20, // Increased gap for visual clarity
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Ring Inner Text
    statInner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        opacity: 0.9,
    },
    statValue: {
        fontSize: 18, // Slightly larger
        color: theme.colors.text,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    statSub: {
        fontSize: 9,
        color: theme.colors.textDim,
        fontWeight: '600',
    },
    // Storage Styles
    storageContainer: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    storageText: {
        fontSize: 10,
        color: theme.colors.textDim,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: 'monospace',
    }
});