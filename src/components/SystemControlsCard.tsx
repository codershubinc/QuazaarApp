import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { AudioOutputSelector } from './AudioOutputSelector';

export const SystemControlsCard = () => {
    const { volumeLevel, isMuted, brightnessLevel, showToast, authToken, setVolumeLevel, setBrightnessLevel } = useAppStore();

    useEffect(() => {
        const fetchSystemState = async () => {
            if (!authToken) return;
            try {
                const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
                const port = await AsyncStorage.getItem('port') || '8765';
                const headers = { 'deviceId': authToken };
                const query = `?deviceId=${encodeURIComponent(authToken)}`;

                // Fetch Volume
                fetch(`http://${ip}:${port}/api/v0.1/system/volume${query}`, { headers })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success && data.volume !== undefined) {
                            setVolumeLevel(data.volume);
                        }
                    })
                    .catch(e => console.log('Volume fetch error', e));

                // Fetch Brightness
                fetch(`http://${ip}:${port}/api/v0.1/system/brightness${query}`, { headers })
                    .then(r => r.json())
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SYSTEM</Text>
            </View>

            {/* Volume Control */}
            <View style={styles.row}>
                <TouchableOpacity
                    onPress={() => {
                        webSocketService.toggleMute();
                        showToast(isMuted ? 'Unmuted' : 'Muted', 'info');
                    }}
                    style={styles.iconContainer}
                >
                    <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={18}
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

                {/* output devices */}



                <Text style={styles.valueText}>{volumeLevel}%</Text>
            </View>
            <AudioOutputSelector />


            {/* Brightness Control */}
            <View style={styles.row}>
                <View style={styles.iconContainer}>
                    <Ionicons name="sunny" size={18} color={theme.colors.warning} />
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
    },
    header: {
        marginBottom: theme.spacing.xs,
        alignItems: 'center',
    },
    headerTitle: {
        color: theme.colors.secondary,
        fontWeight: '600',
        letterSpacing: 2,
        fontSize: 10,
        opacity: 0.8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 4,
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 8,
    },
    valueText: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: 'bold',
        width: 32,
        textAlign: 'right',
        fontFamily: 'monospace',
    },
});
