import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

interface FactData {
    animal: string;
    fact: string;
}

const API_URL = 'https://the-truth-one.vercel.app/api/generate';
const STORAGE_KEY = '@daily_fact_date';
const VISIBILITY_DURATION = 60 * 1000; // 1 minute
const { width } = Dimensions.get('window');

const getIconName = (animalName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const n = animalName.toLowerCase();
    if (n.includes('cat') || n.includes('kitten')) return 'cat';
    if (n.includes('dog') || n.includes('puppy')) return 'dog';
    if (n.includes('bird') || n.includes('parrot')) return 'bird';
    if (n.includes('fish') || n.includes('shark')) return 'fish';
    if (n.includes('rabbit') || n.includes('bunny')) return 'rabbit';
    if (n.includes('bug') || n.includes('ant') || n.includes('bee')) return 'bug';
    if (n.includes('owl')) return 'owl';
    if (n.includes('penguin')) return 'penguin';
    if (n.includes('snake') || n.includes('cobra')) return 'snake';
    if (n.includes('spider')) return 'spider';
    if (n.includes('cow')) return 'cow';
    if (n.includes('duck')) return 'duck';
    if (n.includes('jellyfish')) return 'jellyfish';
    if (n.includes('pig')) return 'pig';
    if (n.includes('deployment')) return 'server-network';
    return 'paw';
};

const FactPopup: React.FC = () => {
    const { isFactPopupOpen, openFactPopup, closeFactPopup } = useAppStore();
    const [data, setData] = useState<FactData | null>(null);
    const [factNumber, setFactNumber] = useState(0);
    const [visible, setVisible] = useState(false);

    // Animation Refs
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const timerAnim = useRef(new Animated.Value(1)).current;

    // --- Logic ---

    const fetchFact = async () => {
        try {
            setFactNumber(Math.floor(Math.random() * 90000) + 10000);
            const response = await fetch(API_URL);
            const result = await response.json();
            if (result && result.fact) {
                setData(result);
            }
        } catch (error) {
            console.log("Fact fetch error", error);
        }
    };

    // Auto-Open Logic
    useEffect(() => {
        const checkAndFetch = async () => {
            try {
                const today = new Date().toDateString();
                const lastShown = await AsyncStorage.getItem(STORAGE_KEY);

                if (lastShown === today) return;

                // Wait 30 minutes before showing automatically
                const DELAY = 30 * 60 * 1000;
                await new Promise(resolve => setTimeout(resolve, DELAY));

                if (!useAppStore.getState().isFactPopupOpen) {
                    openFactPopup();
                    await AsyncStorage.setItem(STORAGE_KEY, today);
                }
            } catch (error) {
                // Silent fail
            }
        };
        checkAndFetch();
    }, []);

    // Open/Close Animation Trigger
    useEffect(() => {
        if (isFactPopupOpen) {
            setVisible(true);
            fetchFact();

            // Enter Animation
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();

            // Start Timer
            timerAnim.setValue(1);
            Animated.timing(timerAnim, {
                toValue: 0,
                duration: VISIBILITY_DURATION,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start(({ finished }) => {
                if (finished) handleClose();
            });

        } else {
            // Exit Animation
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start(() => setVisible(false));
        }
    }, [isFactPopupOpen]);

    const handleClose = () => {
        closeFactPopup();
    };

    if (!visible) return null;

    const iconName = data ? getIconName(data.animal) : 'paw';

    return (
        <Modal transparent visible={visible} onRequestClose={handleClose}>
            <View style={styles.overlay}>
                {/* Dark Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
                </Animated.View>

                {/* Main Card */}
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
                    ]}
                >
                    {/* 1. Header Row */}
                    <View style={styles.header}>
                        <View style={styles.badgeContainer}>
                            <Ionicons name="information-circle" size={12} color={theme.colors.secondary} />
                            <Text style={styles.badgeText}>INTEL #{factNumber}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color={theme.colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    {/* 2. Icon Area */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name={iconName} size={42} color="#FFF" />
                        </View>
                    </View>

                    {/* 3. Text Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.animalName}>
                            {data?.animal?.toUpperCase() || 'LOADING...'}
                        </Text>

                        <View style={styles.factWrapper}>
                            <MaterialCommunityIcons name="format-quote-open" size={24} color={theme.colors.secondary} style={styles.quoteIcon} />
                            <Text style={styles.factText}>
                                {data?.fact || 'Retrieving daily data...'}
                            </Text>
                        </View>
                    </View>

                    {/* 4. Timer Bar (Bottom Border) */}
                    <View style={styles.timerTrack}>
                        <Animated.View
                            style={[
                                styles.timerFill,
                                {
                                    width: timerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        // backdropFilter: 'blur(10px)',  
    },
    card: {
        width: width * 0.85,
        maxWidth: 380,
        backgroundColor: '#1C1C1E', // Matching dashboard dark
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    closeButton: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.secondary, // Uses the secondary (cyan/teal) color
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    animalName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
        textAlign: 'center',
    },
    factWrapper: {
        flexDirection: 'row',
        gap: 8,
    },
    quoteIcon: {
        opacity: 0.5,
        marginTop: -4,
    },
    factText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left',
        flex: 1,
        fontWeight: '400',
    },
    timerTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    timerFill: {
        height: '100%',
        backgroundColor: theme.colors.secondary,
    }
});

export default FactPopup;