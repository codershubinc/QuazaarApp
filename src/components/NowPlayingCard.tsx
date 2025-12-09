import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const NowPlayingCard = () => {
    const { mediaInfo, artWork } = useAppStore();
    const isPlaying = mediaInfo?.Status === 'Playing';
    const rawDuration = mediaInfo?.Length || 0;
    const rawPosition = mediaInfo?.Position || 0;

    // Detect time unit based on duration magnitude
    // Microseconds: 3 mins = 180,000,000
    // Milliseconds: 3 mins = 180,000
    // Seconds: 3 mins = 180
    let timeDivisor = 1;
    if (rawDuration > 10000000) {
        timeDivisor = 1000000; // Microseconds
    } else if (rawDuration > 10000) {
        timeDivisor = 1000; // Milliseconds
    }

    const duration = rawDuration / timeDivisor;
    const position = rawPosition / timeDivisor;
    const progress = duration > 0 ? Math.min(Math.max(position / duration, 0), 1) : 0;

    const formatTime = (seconds: number) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>NOW PLAYING</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: isPlaying ? theme.colors.success : theme.colors.textDim }]} />
                    <Text style={[styles.statusText, { color: isPlaying ? theme.colors.success : theme.colors.textDim }]}>
                        {isPlaying ? 'PLAYING' : 'PAUSED'}
                    </Text>
                </View>
            </View>

            <View style={styles.artworkContainer}>
                {artWork?.url ? (
                    <Image
                        source={{ uri: artWork.url }}
                        style={styles.artwork}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderArtwork}>
                        <Ionicons name="musical-notes" size={80} color={theme.colors.textDim} />
                    </View>
                )}
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {mediaInfo?.Title || 'No Track Playing'}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
                {mediaInfo?.Artist || 'Unknown Artist'}
            </Text>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <LinearGradient
                        colors={[theme.colors.secondary, theme.colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
                    />
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => webSocketService.sendCommand('player_prev')}
                >
                    <Ionicons name="play-skip-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.playButton]}
                    onPress={() => webSocketService.sendCommand('player_toggle')}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={32}
                        color={theme.colors.background}
                        style={{ marginLeft: isPlaying ? 0 : 4 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => webSocketService.sendCommand('player_next')}
                >
                    <Ionicons name="play-skip-forward" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        alignItems: 'center',
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: theme.spacing.l,
    },
    headerTitle: {
        color: theme.colors.secondary,
        fontWeight: '600',
        letterSpacing: 1.5,
        fontSize: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    artworkContainer: {
        width: 240,
        height: 240,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.l,
        ...theme.shadows.glow,
        backgroundColor: '#000',
    },
    artwork: {
        width: '100%',
        height: '100%',
    },
    placeholderArtwork: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    title: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: theme.spacing.s,
    },
    artist: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    progressContainer: {
        width: '100%',
        marginBottom: theme.spacing.l,
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.s,
    },
    timeText: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontFamily: 'monospace',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        alignItems: 'center',
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.secondary,
        ...theme.shadows.glow,
    },
});
