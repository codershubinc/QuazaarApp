import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

const BREAK_TIME = 5 * 60;
const PRESETS = [
    { label: '15m', h: 0, m: 15 },
    { label: '25m', h: 0, m: 25 },
    { label: '45m', h: 0, m: 45 },
    { label: '1h', h: 1, m: 0 },
];

export const PomodoroCard = () => {
    const { showToast } = useAppStore();

    // View State
    const [view, setView] = useState<'SETUP' | 'TIMER'>('SETUP');

    // Timer State
    const [focusDuration, setFocusDuration] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');

    // Setup State (Custom Input)
    const [hrs, setHrs] = useState(0);
    const [mins, setMins] = useState(25);
    const progressAnim = useRef(new Animated.Value(1)).current;

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (interval) clearInterval(interval);
            showToast(`${mode === 'FOCUS' ? 'Focus Session' : 'Break'} Completed!`, 'success');

            if (mode === 'FOCUS') {
                setMode('BREAK');
                setTimeLeft(BREAK_TIME);
            } else {
                setMode('FOCUS');
                setTimeLeft(focusDuration);
            }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, mode]);

    useEffect(() => {
        const totalTime = mode === 'FOCUS' ? focusDuration : BREAK_TIME;
        const progress = totalTime > 0 ? timeLeft / totalTime : 0;

        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
        }).start();
    }, [timeLeft, mode, focusDuration]);

    // --- HANDLERS ---
    const adjustTime = (type: 'hrs' | 'mins', amount: number) => {
        if (type === 'hrs') {
            setHrs(prev => {
                const newVal = prev + amount;
                return newVal < 0 ? 0 : newVal > 12 ? 12 : newVal;
            });
        } else {
            setMins(prev => {
                const newVal = prev + amount;
                return newVal < 0 ? 55 : newVal > 55 ? 0 : newVal;
            });
        }
    };

    const startTimer = () => {
        const totalSeconds = (hrs * 3600) + (mins * 60);
        if (totalSeconds === 0) {
            showToast("Please set a duration", "error");
            return;
        }
        setFocusDuration(totalSeconds);
        setTimeLeft(totalSeconds);
        setMode('FOCUS');
        setIsActive(true);
        setView('TIMER');
    };

    const resetTimer = () => {
        setIsActive(false);
        setMode('FOCUS');
        setTimeLeft(focusDuration);
    };

    const applyPreset = (h: number, m: number) => {
        setHrs(h);
        setMins(m);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            {view === 'SETUP' ? (
                <View style={styles.setupContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.label}>Pomodoro </Text>
                        <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
                            <Ionicons name="play" size={12} color="#000" />
                            <Text style={styles.startBtnText}>START</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Time Picker */}
                    <View style={styles.pickerContainer}>
                        {/* Hours Column */}
                        <View style={styles.pickerColumn}>
                            <TouchableOpacity onPress={() => adjustTime('hrs', 1)} hitSlop={8}>
                                <Ionicons name="chevron-up" size={20} color={theme.colors.textDim} />
                            </TouchableOpacity>
                            <Text style={styles.timeDigit}>{hrs.toString().padStart(2, '0')}</Text>
                            <Text style={styles.unitLabel}>hr</Text>
                            <TouchableOpacity onPress={() => adjustTime('hrs', -1)} hitSlop={8}>
                                <Ionicons name="chevron-down" size={20} color={theme.colors.textDim} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.colon}>:</Text>

                        {/* Minutes Column */}
                        <View style={styles.pickerColumn}>
                            <TouchableOpacity onPress={() => adjustTime('mins', 5)} hitSlop={8}>
                                <Ionicons name="chevron-up" size={20} color={theme.colors.textDim} />
                            </TouchableOpacity>
                            <Text style={styles.timeDigit}>{mins.toString().padStart(2, '0')}</Text>
                            <Text style={styles.unitLabel}>min</Text>
                            <TouchableOpacity onPress={() => adjustTime('mins', -5)} hitSlop={8}>
                                <Ionicons name="chevron-down" size={20} color={theme.colors.textDim} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Presets Footer */}
                    <View style={styles.presetsRow}>
                        {PRESETS.map((p, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.presetChip,
                                    (hrs === p.h && mins === p.m) && styles.presetChipActive
                                ]}
                                onPress={() => applyPreset(p.h, p.m)}
                            >
                                <Text style={[
                                    styles.presetText,
                                    (hrs === p.h && mins === p.m) && styles.presetTextActive
                                ]}>
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                /* --- TIMER VIEW --- */
                <>
                    <View style={styles.progressBgContainer}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                                    backgroundColor: mode === 'FOCUS' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)'
                                }
                            ]}
                        />
                    </View>

                    <View style={styles.timerContent}>
                        <View style={styles.timerHeader}>
                            <View style={styles.modeBadge}>
                                <Ionicons
                                    name={mode === 'FOCUS' ? "flame" : "cafe"}
                                    size={12}
                                    color={mode === 'FOCUS' ? theme.colors.error : theme.colors.success}
                                />
                                <Text style={[styles.modeText, { color: mode === 'FOCUS' ? theme.colors.error : theme.colors.success }]}>
                                    {mode}
                                </Text>
                            </View>

                            <View style={styles.controlsRow}>
                                <TouchableOpacity onPress={resetTimer} style={styles.iconBtn}>
                                    <Ionicons name="refresh" size={14} color={theme.colors.textDim} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setIsActive(false); setView('SETUP'); }} style={styles.iconBtn}>
                                    <Ionicons name="settings-sharp" size={14} color={theme.colors.textDim} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.mainTimerText}>{formatTime(timeLeft)}</Text>

                        <TouchableOpacity
                            style={[styles.playPauseBtn, { borderColor: isActive ? theme.colors.textDim : theme.colors.primary }]}
                            onPress={() => setIsActive(!isActive)}
                        >
                            <Ionicons
                                name={isActive ? "pause" : "play"}
                                size={20}
                                color={isActive ? theme.colors.text : theme.colors.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
        height: 120, // Standardized height
        position: 'relative',
        overflow: 'hidden',
    },
    // SETUP
    setupContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        color: theme.colors.textDim,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    startBtn: {
        flexDirection: 'row',
        backgroundColor: theme.colors.secondary,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        gap: 4,
    },
    startBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 10,
    },

    // PICKER
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginVertical: 4,
    },
    pickerColumn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeDigit: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: 'monospace',
        marginVertical: -2,
    },
    unitLabel: {
        fontSize: 9,
        color: theme.colors.textDim,
        position: 'absolute',
        right: -14,
        bottom: 8,
    },
    colon: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textDim,
        marginBottom: 4,
    },

    // PRESETS
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    presetChip: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    presetChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    presetText: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: '600',
    },
    presetTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },

    // TIMER
    progressBgContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    progressFill: {
        height: '100%',
    },
    timerContent: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    timerHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    modeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
    },
    mainTimerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: 'monospace',
        marginLeft: 8,
        marginTop: 10,
    },
    playPauseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginTop: 10,
    },
});