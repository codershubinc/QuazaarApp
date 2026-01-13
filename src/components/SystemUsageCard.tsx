import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import Svg, { Circle, G } from 'react-native-svg';
import { fetcher } from './helper/Fetcher';

// Create animated wrapper for SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SystemUsageFull {
    cpu_usage: number;
    memory_usage: number;
    memory_used: number;
    memory_total: number;
    gpu_usage: number;
    gpu_memory: number;
    gpu_memory_used: number;
    gpu_memory_total: number;
}

// Helper to format bytes to GiB
const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GiB`;
};

// --- Reusable SVG Circular Progress Component ---
const CircularProgress = ({
    percentage = 0,
    radius = 45, // Adjustable radius 
    strokeWidth = 6,
    color,
    iconName,
    label,
    subLabel
}: any) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Circle Math
    const circumference = 2 * Math.PI * radius;
    const halfCircle = radius + strokeWidth;
    const size = halfCircle * 2;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [percentage]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.ringContainer}>
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
                        {/* Background Track */}
                        <Circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
                        {/* Animated Fill */}
                        <AnimatedCircle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </G>
                </Svg>

                {/* Center Content: Icon & Percentage */}
                <View style={[StyleSheet.absoluteFillObject, styles.ringCenter]}>
                    <Ionicons name={iconName} size={14} color={theme.colors.textDim} style={{ marginBottom: 2 }} />
                    <Text style={[styles.ringPercent, { color }]}>
                        {Math.round(percentage)}%
                    </Text>
                </View>
            </View>

            {/* Labels Below Ring */}
            <View style={styles.ringLabels}>
                <Text style={styles.labelTitle}>{label}</Text>
                {subLabel && (
                    <Text style={styles.labelSub}>{subLabel}</Text>
                )}
            </View>
        </View>
    );
};

// --- Main Card Component ---
export const SystemUsageCard = () => {
    const [usage, setUsage] = useState<SystemUsageFull | null>(null);
    const [loading, setLoading] = useState(true);
    const { authToken } = useAppStore();

    const fetchData = async () => {
        try {
            if (!authToken) return;
            const data = await fetcher('/api/v0.1/system/usage');

            if (data.success && data.usage) {
                setUsage(data.usage);
            }
        } catch (error) {
            // console.error('Failed to fetch system usage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [authToken]);

    if (loading || !usage) {
        return (
            <LinearGradient
                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                style={[styles.card, { minHeight: 200, justifyContent: 'center' }]}
            >
                <Text style={styles.loadingText}>Loading System Stats...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Ionicons name="hardware-chip-outline" size={14} color={theme.colors.secondary} />
                    <Text style={styles.headerText}>SYSTEM RESOURCES</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>LIVE</Text>
                </View>
            </View>

            {/* 2x2 Grid Layout for Rings */}
            <View style={styles.gridContainer}>

                {/* 1. CPU */}
                <CircularProgress
                    percentage={usage.cpu_usage}
                    radius={32}
                    label="CPU Load"
                    color={theme.colors.secondary}
                    iconName="speedometer-outline"
                />

                {/* 2. RAM */}
                <CircularProgress
                    percentage={usage.memory_usage}
                    radius={32}
                    label="RAM"
                    subLabel={`${formatBytes(usage.memory_used)} / ${formatBytes(usage.memory_total)}`}
                    color={theme.colors.accent}
                    iconName="file-tray-stacked-outline"
                />

                {/* 3. GPU Core */}
                <CircularProgress
                    percentage={usage.gpu_usage}
                    radius={32}
                    label="GPU Core"
                    color={theme.colors.primary}
                    iconName="aperture-outline"
                />

                {/* 4. VRAM */}
                <CircularProgress
                    percentage={usage.gpu_memory}
                    radius={32}
                    label="VRAM"
                    subLabel={`${formatBytes(usage.gpu_memory_used)} / ${formatBytes(usage.gpu_memory_total)}`}
                    color={theme.colors.warning}
                    iconName="cube-outline"
                />

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
        marginBottom: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    headerText: {
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
    },
    badge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    loadingText: {
        color: theme.colors.textDim,
        fontSize: 12,
        alignSelf: 'center',
    },
    // Grid Logic
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Spreads items to edges
        rowGap: 20, // Vertical spacing between rows
    },
    // Ring Styles
    ringContainer: {
        width: '48%', // Ensure 2 items fit per row
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    ringCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringPercent: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    ringLabels: {
        marginTop: 8,
        alignItems: 'center',
    },
    labelTitle: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    labelSub: {
        color: theme.colors.textDim,
        fontSize: 9,
        marginTop: 2,
    },
});