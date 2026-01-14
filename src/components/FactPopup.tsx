import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';

interface FactData {
    animal: string;
    fact: string;
}

const API_URL = 'https://the-truth-one.vercel.app/api/generate';
const STORAGE_KEY = '@daily_fact_date';
const VISIBILITY_DURATION = 60 * 1000; //   1 minutewqq 

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
    return 'paw'; // Default fallback
};

const FactPopup: React.FC = () => {
    const { isFactPopupOpen, openFactPopup, closeFactPopup } = useAppStore();
    const [data, setData] = useState<FactData | null>(null);
    const [factNumber, setFactNumber] = useState(0);
    const [visible, setVisible] = useState(false);
    const [touched, setTouched] = useState(false);

    // Animation Values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const timerAnim = useRef(new Animated.Value(1)).current;

    // Fetch Fact Function
    const fetchFact = async () => {
        try {
            setFactNumber(Math.floor(Math.random() * 90000) + 10000); // Random 5 digit number
            const response = await fetch(API_URL);
            const result = await response.json();
            if (result && result.fact) {
                setData(result);
            }
        } catch (error) {
            console.log("Fact fetch error", error);
        }
    };

    // Automatic Check on Mount
    useEffect(() => {
        const checkAndFetch = async () => {
            try {
                const today = new Date().toDateString();
                const lastShown = await AsyncStorage.getItem(STORAGE_KEY);

                if (lastShown === today) {
                    return;
                }

                // Wait 30 minutes before showing
                const DELAY_30_MIN = 30 * 60 * 1000;
                await new Promise(resolve => setTimeout(resolve, DELAY_30_MIN));

                // If the user hasn't opened it manually yet, open it
                if (!useAppStore.getState().isFactPopupOpen) {
                    openFactPopup();
                    await AsyncStorage.setItem(STORAGE_KEY, today);
                }
            } catch (error) {
                // console.log("Fact check error", error);
            }
        };

        checkAndFetch();
    }, []);

    // Handle Open/Close state from Store
    useEffect(() => {
        if (isFactPopupOpen) {
            setVisible(true); // Mount the modal
            fetchFact(); // Always fetch fresh
            startEnterAnimation();
        } else {
            startExitAnimation(() => setVisible(false));
        }
    }, [isFactPopupOpen]);

    // Auto-close timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isFactPopupOpen && !touched) {
            // Start Timer Animation
            timerAnim.setValue(1);
            Animated.timing(timerAnim, {
                toValue: 0,
                duration: VISIBILITY_DURATION,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();

            timer = setTimeout(() => {
                handleClose();
            }, VISIBILITY_DURATION);
        } else {
            timerAnim.stopAnimation();
        }
        return () => {
            clearTimeout(timer);
            timerAnim.stopAnimation();
        };
    }, [isFactPopupOpen, touched]);

    const startEnterAnimation = () => {
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const startExitAnimation = (onFinish?: () => void) => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(onFinish);
    };

    const handleClose = () => {
        closeFactPopup();
        setTouched(false);
    };

    const showModal = () => openFactPopup();
    const hideModal = () => closeFactPopup();

    if (!visible) return null;

    const iconName = data ? getIconName(data.animal) : 'paw';

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                {/* Backdrop with Fade In */}
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
                </Animated.View>

                {/* Main Card with Scale In */}
                <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                    <LinearGradient
                        colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                        style={styles.card}
                    >
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={20} color={theme.colors.textDim} />
                        </TouchableOpacity>

                        <View style={styles.content}>
                            {/* Icon Bubble */}
                            <View style={styles.iconWrapper}>
                                <LinearGradient
                                    colors={[theme.colors.secondary, 'rgba(0,0,0,0)']}
                                    style={styles.iconGradient}
                                >
                                    <MaterialCommunityIcons name={iconName} size={32} color="#fff" />
                                </LinearGradient>
                            </View>


                            {/* Title */}
                            <Text style={styles.didYouKnow}>FACT #{factNumber}</Text>
                            <Text style={styles.animalTitle}>{data?.animal?.toUpperCase() || 'LOADING...'}</Text>

                            <View style={styles.divider} />

                            {/* Fact */}
                            <Text style={styles.factText}>
                                {data?.fact ? `"${data.fact}"` : 'Fetching interesting fact...'}
                            </Text>
                        </View>


                        {/* Timer Bar (Visual decoration) */}
                        {!touched && (
                            <Animated.View
                                style={[
                                    styles.timerBar,
                                    {
                                        width: timerAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%']
                                        })
                                    }
                                ]}
                            />
                        )}
                    </LinearGradient>
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker for focus
    },
    cardContainer: {
        width: '85%',
        maxWidth: 400,
        borderRadius: 24,
        ...theme.shadows.glow,
        // Force shadow for Android
        elevation: 10,
        shadowColor: theme.colors.secondary,
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconWrapper: {
        marginBottom: 16,
        shadowColor: theme.colors.secondary,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    iconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    didYouKnow: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 4,
    },
    animalTitle: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 1,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        width: 40,
        backgroundColor: theme.colors.secondary,
        marginVertical: 16,
        opacity: 0.5,
    },
    factText: {
        color: theme.colors.textSecondary,
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '500',
        fontStyle: 'italic',
        marginTop: 10,
    },
    timerBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: theme.colors.secondary,
        opacity: 0.3,
    }
});

export default FactPopup;