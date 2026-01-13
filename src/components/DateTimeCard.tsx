import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { FlipClock } from './FlipClock';
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

// --- Main Card ---
export const DateTimeCard = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });

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

                {/* RIGHT: Clock */}
                <View style={[styles.rightContainer, { flex: 1 }]}>
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
        maxHeight: 120, // Limit height since stats are gone
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 16, // Increased font size for date
        fontWeight: '600',
    }
});