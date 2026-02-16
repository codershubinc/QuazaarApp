import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

const BREAK_TIME = 5 * 60;
const PRESETS = [
    { label: '15m', m: 15 },
    { label: '25m', m: 25 },
    { label: '45m', m: 45 },
    { label: '60m', m: 60 },
];

export const PomodoroCard = () => {
    const { showToast } = useAppStore();

    // View & Logic State
    const [view, setView] = useState<'SETUP' | 'TIMER'>('SETUP');
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
    const [isActive, setIsActive] = useState(false);

    // Time State
    const [duration, setDuration] = useState(25 * 60); // Total time for calculation
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Current ticker

    // Setup Inputs
    const [setupMins, setSetupMins] = useState(25);

    // Animation Values
    const progressAnim = useRef(new Animated.Value(0)).current;

    // --- Colors based on Mode ---
    const activeColor = mode === 'FOCUS' ? '#FF453A' : '#30D158'; // iOS Red : iOS Green
    const bgFillColor = mode === 'FOCUS' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(48, 209, 88, 0.15)';

    // --- Timer Tick ---
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer Finished
            setIsActive(false);
            showToast(`${mode === 'FOCUS' ? 'Focus' : 'Break'} session complete`, 'success');

            // Auto-switch modes for next run
            if (mode === 'FOCUS') {
                setMode('BREAK');
                setDuration(BREAK_TIME);
                setTimeLeft(BREAK_TIME);
            } else {
                setMode('FOCUS');
                setDuration(setupMins * 60);
                setTimeLeft(setupMins * 60);
            }
            setView('SETUP');
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft]);

    // --- Progress Animation ---
    useEffect(() => {
        if (duration > 0) {
            const progress = 1 - (timeLeft / duration);
            Animated.timing(progressAnim, {
                toValue: progress,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: false // width animation requires false
            }).start();
        }
    }, [timeLeft, duration]);

    // --- Actions ---
    const adjustSetupTime = (delta: number) => {
        setSetupMins(prev => {
            const next = prev + delta;
            return next < 1 ? 1 : next > 120 ? 120 : next;
        });
    };

    const handleStart = () => {
        setMode('FOCUS'); // Always start fresh as Focus
        const seconds = setupMins * 60;
        setDuration(seconds);
        setTimeLeft(seconds);
        setIsActive(true);
        setView('TIMER');
    };

    const handleReset = () => {
        setIsActive(false);
        setView('SETUP');
        progressAnim.setValue(0);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.card}>

            {/* --- SETUP VIEW --- */
                view === 'SETUP' ? (
                    <View style={styles.contentContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <Ionicons name="timer-outline" size={14} color={theme.colors.textSecondary} />
                                <Text style={styles.headerTitle}>POMODORO</Text>
                            </View>
                            {/* Play Button */}
                            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                                <Ionicons name="play" size={16} color="#000" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Main Picker */}
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity onPress={() => adjustSetupTime(-5)} style={styles.adjustBtn}>
                                <Ionicons name="remove" size={24} color={theme.colors.textDim} />
                            </TouchableOpacity>

                            <View style={styles.timeDisplay}>
                                <Text style={styles.hugeTimeText}>{setupMins}</Text>
                                <Text style={styles.unitText}>min</Text>
                            </View>

                            <TouchableOpacity onPress={() => adjustSetupTime(5)} style={styles.adjustBtn}>
                                <Ionicons name="add" size={24} color={theme.colors.textDim} />
                            </TouchableOpacity>
                        </View>

                        {/* Presets */}
                        <View style={styles.presetsRow}>
                            {PRESETS.map((p) => (
                                <TouchableOpacity
                                    key={p.label}
                                    style={[styles.presetChip, setupMins === p.m && styles.presetChipActive]}
                                    onPress={() => setSetupMins(p.m)}
                                >
                                    <Text style={[styles.presetText, setupMins === p.m && styles.presetTextActive]}>
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    /* --- TIMER VIEW --- */
                    <View style={styles.timerContainer}>
                        {/* Background Fill Animation */}
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    backgroundColor: bgFillColor,
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]}
                        />

                        {/* Timer Header */}
                        <View style={styles.timerHeader}>
                            <View style={[styles.statusPill, { borderColor: activeColor }]}>
                                <View style={[styles.dot, { backgroundColor: activeColor }]} />
                                <Text style={[styles.statusText, { color: activeColor }]}>
                                    {mode === 'FOCUS' ? 'FOCUSING' : 'ON BREAK'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleReset}>
                                <Ionicons name="close-circle" size={24} color={theme.colors.textDim} />
                            </TouchableOpacity>
                        </View>

                        {/* Big Countdown */}
                        <View style={styles.countdownWrapper}>
                            <Text style={styles.countdownText}>{formatTime(timeLeft)}</Text>
                        </View>

                        {/* Footer Controls */}
                        <View style={styles.timerControls}>
                            <TouchableOpacity
                                style={styles.circleBtn}
                                onPress={() => setIsActive(!isActive)}
                            >
                                <Ionicons
                                    name={isActive ? "pause" : "play"}
                                    size={28}
                                    color={theme.colors.text}
                                    style={{ marginLeft: isActive ? 0 : 4 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        height: 180, // Fixed comfortable height
        borderRadius: 28,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
        width: "auto"
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerTitle: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    startBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Picker
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    adjustBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeDisplay: {
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    hugeTimeText: {
        fontSize: 48,
        fontWeight: '300',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: -2,
        lineHeight: 56,
    },
    unitText: {
        fontSize: 14,
        color: theme.colors.textDim,
        marginBottom: 10,
        marginLeft: 4,
        fontWeight: '600',
    },
    // Presets
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    presetChip: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    presetChipActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    presetText: {
        color: theme.colors.textDim,
        fontSize: 11,
        fontWeight: '600',
    },
    presetTextActive: {
        color: '#FFF',
    },
    // Timer View
    timerContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    timerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    countdownWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    countdownText: {
        fontSize: 56,
        fontWeight: '700', // Bold for visibility
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 2,
    },
    timerControls: {
        alignItems: 'center',
    },
    circleBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});