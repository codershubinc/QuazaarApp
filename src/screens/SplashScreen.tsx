import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isCursorVisible, setIsCursorVisible] = useState(true);
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const projectName = 'QUAZAAR';

    useEffect(() => {
        // Scale animation
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();

        // Typing animation
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex < projectName.length) {
                setDisplayedText((prev) => prev + projectName[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    onFinish();
                }, 800);
            }
        }, 150);

        // Cursor blinking
        const cursorInterval = setInterval(() => {
            setIsCursorVisible((prev) => !prev);
        }, 500);

        return () => {
            clearInterval(typingInterval);
            clearInterval(cursorInterval);
        };
    }, []);

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.surface, theme.colors.background]}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.circle} />

                <Animated.View style={[styles.textContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.text}>{displayedText}</Text>
                    {displayedText.length < projectName.length && (
                        <Text style={[styles.cursor, { opacity: isCursorVisible ? 1 : 0 }]}>|</Text>
                    )}
                </Animated.View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        position: 'absolute',
        ...theme.shadows.glow,
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 56,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: 'monospace',
        letterSpacing: 3,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    cursor: {
        fontSize: 56,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        fontFamily: 'monospace',
        marginLeft: 8,
    },
});
