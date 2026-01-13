import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { AudioOutputSelector } from './AudioOutputSelector';
import { fetcher } from './helper/Fetcher';

export const SystemControlsCard = () => {
    const { volumeLevel, isMuted, brightnessLevel, showToast, authToken, setVolumeLevel, setBrightnessLevel } = useAppStore();

    useEffect(() => {
        const fetchSystemState = async () => {
            if (!authToken) return;
            try {
                // Fetch Volume
                fetcher('/api/v0.1/system/volume')
                    .then(data => {
                        if (data.success && data.volume !== undefined) {
                            setVolumeLevel(data.volume);
                        }
                    })
                    .catch(e => console.log('Volume fetch error', e));

                // Fetch Brightness
                fetcher('/api/v0.1/system/brightness')
                    .then(data => {
                        if (data.success && data.brightness !== undefined) {
                            setBrightnessLevel(data.brightness);
                        }
                    })
                    .catch(e => console.log('Brightness fetch error', e));

            } catch (error) {
                console.error("System state fetch failed", error);
            }
        };

        fetchSystemState();
        const interval = setInterval(fetchSystemState, 6000); // Sync every 6 seconds
        return () => clearInterval(interval);
    }, [authToken]);

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            {/* Header: Compact Row */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <Ionicons name="settings-outline" size={10} color={theme.colors.secondary} />
                    <Text style={styles.headerTitle}>SYSTEM</Text>
                </View>
                {/* Audio Selector inline or slightly below if needed. Currently keeping it separate for clarity */}
            </View>

            <View style={styles.controlsContainer}>

                {/* Volume Control */}
                <View style={styles.controlRow}>
                    <TouchableOpacity
                        onPress={() => {
                            webSocketService.toggleMute();
                            showToast(isMuted ? 'Unmuted' : 'Muted', 'info');
                        }}
                        style={styles.iconContainer}
                    >
                        <Ionicons
                            name={isMuted ? "volume-mute" : "volume-high"}
                            size={16}
                            color={isMuted ? theme.colors.error : theme.colors.secondary}
                        />
                    </TouchableOpacity>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={volumeLevel}
                        onValueChange={(val) => setVolumeLevel(val)}
                        onSlidingComplete={(val) => webSocketService.setVolume(val)}
                        minimumTrackTintColor={isMuted ? theme.colors.error : theme.colors.secondary}
                        maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                        thumbTintColor="#FFFFFF"
                    />
                    <Text style={styles.valueText}>{volumeLevel}%</Text>
                </View>

                {/* Audio Output Selector (Compact version assumed) */}
                <View style={{ marginVertical: 2, paddingLeft: 30 }}>
                    <AudioOutputSelector />
                </View>

                {/* Brightness Control */}
                <View style={styles.controlRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="sunny" size={16} color={theme.colors.warning} />
                    </View>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={brightnessLevel}
                        onValueChange={(val) => setBrightnessLevel(val)}
                        onSlidingComplete={(val) => webSocketService.setBrightness(val)}
                        minimumTrackTintColor={theme.colors.warning}
                        maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                        thumbTintColor="#FFFFFF"
                    />
                    <Text style={styles.valueText}>{brightnessLevel}%</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: 12, // Reduced padding
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.m,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    headerTitle: {
        color: theme.colors.textSecondary,
        fontWeight: '700',
        fontSize: 9,
        letterSpacing: 1,
    },
    controlsContainer: {
        gap: 2, // Tighter gap between rows
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 28, // Fixed height for consistency
    },
    iconContainer: {
        width: 20,
        alignItems: 'center',
        marginRight: 4,
    },
    slider: {
        flex: 1,
        height: 28, // Reduced height
        marginHorizontal: 4,
        transform: [{ scaleY: 0.9 }] // Visually slims the slider track slightly if needed
    },
    valueText: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: 'bold',
        width: 30,
        textAlign: 'right',
        fontFamily: 'monospace',
    },
});