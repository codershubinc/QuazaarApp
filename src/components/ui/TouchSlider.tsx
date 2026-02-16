import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface TouchSliderProps {
    value: number; // 0-100
    onValueChange: (value: number) => void;
    onSlidingComplete: (value: number) => void;
    color?: string;
    height?: number;
}

export const TouchSlider = ({
    value,
    onValueChange,
    onSlidingComplete,
    color = theme.colors.primary,
    height = 6
}: TouchSliderProps) => {
    const [width, setWidth] = useState(0);
    const [isTouching, setIsTouching] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        if (!isTouching) {
            setLocalValue(value);
        }
    }, [value, isTouching]);

    const updateValue = (x: number) => {
        if (width <= 0) return;
        let newValue = Math.round((x / width) * 100);
        newValue = Math.max(0, Math.min(100, newValue));
        setLocalValue(newValue);
        onValueChange(newValue);
    };

    return (
        <View
            style={[styles.container, { height: height + 24 }]} // Extra height for touch area
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
                setIsTouching(true);
                updateValue(e.nativeEvent.locationX);
            }}
            onResponderMove={(e) => {
                updateValue(e.nativeEvent.locationX);
            }}
            onResponderRelease={() => {
                setIsTouching(false);
                onSlidingComplete(localValue);
            }}
        >
            <View style={[styles.trackContainer, { height }]}>
                <View style={styles.track} />
                <LinearGradient
                    colors={[theme.colors.secondary, color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.fill, { width: `${localValue}%` }]}
                />
            </View>

            {/* Thumb */}
            <View style={[styles.thumb, { left: `${localValue}%`, marginTop: 12 - 6 }]} />

            {/* Pop-up Tooltip */}
            {isTouching && (
                <View style={[styles.tooltipContainer, { left: `${localValue}%` }]}>
                    <View style={[styles.tooltipBubble, { backgroundColor: color }]}>
                        <Text style={styles.tooltipText}>{localValue}%</Text>
                    </View>
                    <View style={[styles.tooltipArrow, { borderTopColor: color }]} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        width: '100%',
    },
    trackContainer: {
        width: '100%',
        justifyContent: 'center',
        borderRadius: 4,
        overflow: 'hidden',
    },
    track: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
    thumb: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
        marginLeft: -6, // Center the thumb
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    tooltipContainer: {
        position: 'absolute',
        top: -24,
        alignItems: 'center',
        marginLeft: -16, // roughly half of width (32)
        width: 32,
    },
    tooltipBubble: {
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        minWidth: 28,
        alignItems: 'center',
    },
    tooltipText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
});
