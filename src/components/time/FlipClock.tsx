import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { theme } from '../constants/theme';

interface FlipDigitProps {
    value: string | number;
}

const FlipDigit = ({ value }: FlipDigitProps) => {
    const [displayValue, setDisplayValue] = useState(value);
    const animatedValue = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (value !== displayValue) {
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

            // Change the value halfway through
            setTimeout(() => {
                setDisplayValue(value);
            }, 150);
        }
    }, [value]);

    const animatedStyle = {
        transform: [
            { perspective: 1000 },
            {
                rotateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg']
                })
            }
        ],
        opacity: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.5, 0] // Fade out slightly at edge
        })
    };

    return (
        <View style={styles.digitContainer}>
            <Animated.View style={[styles.digitCard, animatedStyle]}>
                <Text style={styles.digitText}>{displayValue}</Text>
            </Animated.View>
        </View>
    );
};

export const FlipClock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const midnight = new Date(date);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - date.getTime();

    // Calculate remaining hours and minutes
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const remainingHours = h.toString().padStart(2, '0');
    const remainingMinutes = m.toString().padStart(2, '0');

    const currentHours = date.getHours().toString().padStart(2, '0');
    const currentMinutes = date.getMinutes().toString().padStart(2, '0');
    const currentSeconds = date.getSeconds().toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            <Text style={styles.header}> <Text style={{ fontStyle: "italic" }}>remaining</Text>:{remainingHours + "hrs"} and {remainingMinutes + "min"}</Text>
            <View style={styles.clockContainer}>
                <View style={styles.group}>
                    <FlipDigit value={currentHours[0]} />
                    <FlipDigit value={currentHours[1]} />
                </View>
                <Text style={styles.separator}>:</Text>
                <View style={styles.group}>
                    <FlipDigit value={currentMinutes[0]} />
                    <FlipDigit value={currentMinutes[1]} />
                </View>
                <Text style={styles.secondsText}>{currentSeconds}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 0,
    },
    header: {
        color: theme.colors.text,
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        opacity: 0.6,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    secondsText: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 2,
        fontWeight: 'bold',
        opacity: 0.8,
        alignSelf: 'flex-end',
        marginBottom: 2,
    },
    clockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    group: {
        flexDirection: 'row',
        gap: 0,
    },
    digitContainer: {
        width: 32,
        height: 48,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    digitCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    digitText: {
        color: theme.colors.secondary,
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    separator: {
        color: theme.colors.secondary,
        fontSize: 20,
        fontWeight: 'bold',
        opacity: 0.8,
        marginTop: -4,
    }
});
