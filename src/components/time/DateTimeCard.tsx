import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// --- 1. Ticker Digit Component (Vertical Slide Animation) ---
const TickerDigit = ({ value, fontSize = 48 }: { value: string | number; fontSize?: number }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const animY = useRef(new Animated.Value(0)).current;

    const HEIGHT = fontSize * 1.2; // Container height based on font size

    useEffect(() => {
        if (value !== currentValue) {
            setPrevValue(currentValue);
            setCurrentValue(value);

            // Reset position
            animY.setValue(0);

            // Slide Up Animation
            Animated.timing(animY, {
                toValue: -HEIGHT,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                // After animation, reset (visually instant)
                setPrevValue(value);
                animY.setValue(0);
            });
        }
    }, [value]);

    return (
        <View style={{ height: HEIGHT, overflow: 'hidden', minWidth: fontSize * 0.6 }}>
            <Animated.View style={{ transform: [{ translateY: animY }] }}>
                {/* Previous Number (slides out to top) */}
                <View style={{ height: HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.digitText, { fontSize }]}>{prevValue}</Text>
                </View>
                {/* Current Number (slides in from bottom) */}
                <View style={{ height: HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.digitText, { fontSize }]}>{currentValue}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

// --- 2. The Clock Logic ---
export const DigitalClock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Time calculations
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');

    // Day Progress / Remaining Logic
    const midnight = new Date(date);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - date.getTime();
    const remHours = Math.floor(diff / (1000 * 60 * 60));
    const remMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Percentage of day passed (for progress bar)
    const totalDayMinutes = 24 * 60;
    const currentDayMinutes = (date.getHours() * 60) + date.getMinutes();
    const dayProgress = (currentDayMinutes / totalDayMinutes) * 100;

    return (
        <View style={styles.clockWrapper}>
            {/* Big Time Display */}
            <View style={styles.timeRow}>
                <View style={styles.digitGroup}>
                    <TickerDigit value={h[0]} />
                    <TickerDigit value={h[1]} />
                </View>

                {/* Blinking Colon */}
                <Text style={styles.colon}>:</Text>

                <View style={styles.digitGroup}>
                    <TickerDigit value={m[0]} />
                    <TickerDigit value={m[1]} />
                </View>

                {/* Small Seconds */}
                <View style={styles.secondsContainer}>
                    <Text style={styles.secondsText}>{s}</Text>
                </View>
            </View>

            {/* Day Progress Footer */}
            <View style={styles.footerContainer}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${dayProgress}%` }]} />
                </View>
                <Text style={styles.remainingText}>
                    <Text style={{ color: theme.colors.secondary }}>REM: </Text>
                    {remHours}h {remMins}m
                </Text>
            </View>
        </View>
    );
};

// --- 3. Main Card Container ---
export const DateTimeCard = () => {
    const [date, setDate] = useState(new Date());

    // Update date less frequently
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    }).toUpperCase();

    return (
        <View style={styles.card}>
            {/* Header: Date Pill */}
            <View style={styles.header}>
                <View style={styles.datePill}>
                    <Ionicons name="calendar-clear-outline" size={12} color={theme.colors.textDim} />
                    <Text style={styles.dateText}>{dateString}</Text>
                </View>
            </View>

            {/* Content: The Clock */}
            <DigitalClock />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l, // Matches your other cards (28/32)
        padding: 16,
        backgroundColor: '#1C1C1E', // Fallback
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: theme.spacing.m,
        justifyContent: 'center',
        minWidth: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    clockWrapper: {
        alignItems: 'center',
        gap: 12,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline', // Aligns seconds to bottom
        justifyContent: 'center',
    },
    digitGroup: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)', // Subtle box behind numbers
        borderRadius: 8,
        paddingHorizontal: 2,
    },
    digitText: {
        color: '#FFFFFF',
        fontWeight: '300', // Thin, modern font weight
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    colon: {
        fontSize: 40,
        color: theme.colors.textDim,
        fontWeight: '200',
        marginHorizontal: 4,
        transform: [{ translateY: -4 }]
    },
    secondsContainer: {
        marginLeft: 6,
        paddingBottom: 8, // Align with baseline
    },
    secondsText: {
        fontSize: 14,
        color: theme.colors.secondary,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    footerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    progressTrack: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.secondary, // or theme.colors.primary
        borderRadius: 2,
    },
    remainingText: {
        fontSize: 10,
        color: theme.colors.textDim,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: '600',
        minWidth: 80,
        textAlign: 'right',
    },
});