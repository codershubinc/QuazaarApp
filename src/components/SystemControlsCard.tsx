import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    PanResponderGestureState,
    GestureResponderEvent
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetcher } from './helper/Fetcher';

// --- Helpers ---

const getDeviceIcon = (name: string, desc: string): keyof typeof Ionicons.glyphMap => {
    const lower = (name + desc || '').toLowerCase();
    if (lower.includes('headphone') || lower.includes('headset')) return 'headset';
    if (lower.includes('hdmi') || lower.includes('displayport')) return 'tv-outline';
    if (lower.includes('bluetooth') || lower.includes('bluez')) return 'bluetooth';
    return 'volume-high';
};

// --- Interfaces ---

interface VerticalSliderProps {
    value: number;
    onValueChange: (val: number) => void;
    onSlidingComplete: (val: number) => void;
    iconName: keyof typeof Ionicons.glyphMap;
    activeIconColor: string;
    inactiveIconColor?: string;
}

// --- Custom Vertical Slider Component ---

const VerticalSlider: React.FC<VerticalSliderProps> = ({
    value,
    onValueChange,
    onSlidingComplete,
    iconName,
    activeIconColor,
    inactiveIconColor = theme.colors.textDim
}) => {
    // Height of the slider container
    const CONTAINER_HEIGHT = 160;

    // Local state for smooth UI updates before server sync
    const [localValue, setLocalValue] = useState<number>(value);

    // Refs to track values for PanResponder (avoiding closure staleness)
    const localValueRef = useRef(value);
    const startValueRef = useRef(value);

    useEffect(() => {
        setLocalValue(value);
        localValueRef.current = value;
    }, [value]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Capture the value at the start of the gesture
                startValueRef.current = localValueRef.current;
            },
            onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                // Dragging UP is negative dy. We invert it.
                // Divide by 2.5 to control sensitivity (pixels to percentage).
                const sensitivity = 2.5;
                const change = -gestureState.dy / sensitivity;

                const newValue = Math.min(Math.max(startValueRef.current + change, 0), 100);

                setLocalValue(newValue);
                localValueRef.current = newValue;
                onValueChange(newValue);
            },
            onPanResponderRelease: () => {
                onSlidingComplete(localValueRef.current);
            },
        })
    ).current;

    // Calculate height percentage
    const fillHeight = (localValue / 100) * CONTAINER_HEIGHT;

    // Determine icon color based on fill level. 
    // If fill is very low (< 15%), the icon sits on the dark background -> use light gray.
    // If fill is high, the icon sits on the white background -> use the active color.
    const currentIconColor = localValue > 18 ? activeIconColor : inactiveIconColor;

    return (
        <View
            style={[styles.sliderContainer, { height: CONTAINER_HEIGHT }]}
            {...panResponder.panHandlers}
        >
            {/* Background Track (Dark) */}
            <View style={styles.sliderTrack} />

            {/* Foreground Fill (White) */}
            <View style={[styles.sliderFill, { height: fillHeight }]} />

            {/* Percentage Text - Shows when dragging or always? User said "show %" */}
            <View style={styles.textWrapper}>
                <Text style={[
                    styles.percentageText,
                    { color: "white", fontFamily: 'safe', fontWeight: '600' }
                ]}>
                    {Math.round(localValue)}%
                </Text>
            </View>

            {/* Icon Layer - Absolute positioned at bottom */}
            <View style={styles.iconWrapper}>
                <Ionicons
                    name={iconName}
                    size={24} // Slightly smaller icon for narrower slider
                    color={currentIconColor}
                />
            </View>
        </View>
    );
};

// --- Main Component ---

export const SystemControlsCard: React.FC = () => {
    const {
        volumeLevel,
        isMuted,
        brightnessLevel,
        authToken,
        setVolumeLevel,
        setBrightnessLevel
    } = useAppStore();

    const [activeDevice, setActiveDevice] = useState<{ name: string, description: string } | null>(null);

    useEffect(() => {
        const fetchSystemState = async () => {
            if (!authToken) return;
            try {
                // Fetch Volume
                fetcher('/api/v0.1/system/volume')
                    .then((data: any) => {
                        if (data.success && data.volume !== undefined) {
                            setVolumeLevel(data.volume);
                        }
                    })
                    .catch((e: Error) => console.log('Volume fetch error', e));

                // Fetch Brightness
                fetcher('/api/v0.1/system/brightness')
                    .then((data: any) => {
                        if (data.success && data.brightness !== undefined) {
                            setBrightnessLevel(data.brightness);
                        }
                    })
                    .catch((e: Error) => console.log('Brightness fetch error', e));

                // Fetch Audio Devices for Icon
                fetcher('/api/v0.1/system/sound/devices')
                    .then((data: any) => {
                        if (data.success && Array.isArray(data.devices)) {
                            const active = data.devices.find((d: any) => d.active);
                            if (active) setActiveDevice(active);
                        }
                    })
                    .catch((e: Error) => console.log('Audio device fetch error', e));

            } catch (error) {
                console.error("System state fetch failed", error);
            }
        };

        fetchSystemState();
        const interval = setInterval(fetchSystemState, 5000);
        return () => clearInterval(interval);
    }, [authToken]);

    // Determine volume icon
    const volumeIcon = isMuted || volumeLevel === 0
        ? "volume-mute"
        : (activeDevice ? getDeviceIcon(activeDevice.name, activeDevice.description) : "volume-high");

    return (
        <View style={styles.card}>
            <View style={styles.gridContainer}>

                {/* Brightness Pill */}
                <VerticalSlider
                    value={brightnessLevel}
                    onValueChange={(val) => setBrightnessLevel(Math.round(val))}
                    onSlidingComplete={(val) => webSocketService.setBrightness(Math.round(val))}
                    iconName="sunny"
                    activeIconColor={theme.colors.warning}
                    inactiveIconColor={theme.colors.textDim}
                />

                {/* Volume Pill */}
                <VerticalSlider
                    value={volumeLevel}
                    onValueChange={(val) => setVolumeLevel(Math.round(val))}
                    onSlidingComplete={(val) => webSocketService.setVolume(Math.round(val))}
                    iconName={volumeIcon}
                    activeIconColor={theme.colors.background}
                    inactiveIconColor={theme.colors.textDim}
                />

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.m,
        paddingHorizontal: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center them
        alignItems: 'center',
        gap: 24, // Increased gap
    },
    // Slider Styles
    sliderContainer: {
        width: 70, // Fixed small width
        borderRadius: 35,
        backgroundColor: theme.colors.surfaceHighlight,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    sliderTrack: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surface,
    },
    sliderFill: {
        backgroundColor: "#3a3434",
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    iconWrapper: {
        position: 'absolute',
        bottom: 16,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
    },
    textWrapper: {
        position: 'absolute',
        bottom: 50, // Position above the icon
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'monospace',
        color: "white",
    }
});