import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import { theme } from '../../constants/theme';
import { webSocketService } from '../../services/WebSocketService';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { SpotifyIcon } from '../helper/SpotifyIcon';

export const NowPlayingCard = () => {
    const { mediaInfo, artWork, backgroundImage } = useAppStore();
    const isPlaying = mediaInfo?.Status === 'Playing';
    const rawDuration = mediaInfo?.Length || 0;
    const rawPosition = mediaInfo?.Position || 0;

    // Data is in microseconds, convert to seconds
    const duration = rawDuration / 1000000;
    const position = rawPosition / 1000000;
    const progress = duration > 0 ? Math.min(Math.max(position / duration, 0), 1) : 0;

    const formatTime = (seconds: number) => {
        if (!seconds && seconds !== 0) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const extractPlayerName = (playerString?: string) => {
        if (!playerString) return 'main';
        // Extract player name from strings like "firefox.instance_1_1314"
        const name = playerString.split('.')[0];
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const getPlayerIcon = (playerString?: string): any => {
        if (!playerString) return 'tv-outline';

        const name = playerString.toLowerCase();

        // Map player names to appropriate icons
        if (name.includes('firefox')) return 'logo-firefox';
        if (name.includes('chrome')) return 'logo-chrome';
        if (name.includes('edge')) return 'logo-edge';
        if (name.includes('spotify')) return 'spotify';
        if (name.includes('vlc')) return 'videocam';
        if (name.includes('youtube')) return 'logo-youtube';
        if (name.includes('safari')) return 'logo-safari';
        if (name.includes('opera')) return 'logo-opera';
        if (name.includes('mpv')) return 'play-circle';
        if (name.includes('rhythmbox')) return 'disc';
        if (name.includes('clementine')) return 'musical-note';
        if (name.includes('audacious')) return 'headset';
        if (name.includes('banshee')) return 'radio';
        if (name.includes('mpd')) return 'server';

        // Default icon
        return 'tv-outline';
    };

    const isSpotify = mediaInfo?.Player?.toLowerCase().includes('spotify');

    const remainingTime = duration - position;

    return (
        <View style={styles.cardContainer}>

            <View style={styles.card}>
                {/* Main Content with Artwork and Info */}
                <View style={styles.mainContent}>
                    {/* Album Artwork */}
                    <View style={styles.artworkContainer}>
                        {artWork?.url ? (
                            <Image
                                source={{ uri: artWork.url }}
                                style={styles.artwork}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderArtwork}>
                                <Ionicons name="musical-notes" size={48} color={theme.colors.textDim} />
                            </View>
                        )}
                    </View>

                    {/* Info Container with Blur Overlay */}
                    <View style={styles.infoContainer}>
                        {/* Semi-transparent overlay on text area */}
                        {artWork?.url && (
                            <View style={styles.infoBlur} />
                        )}

                        <View style={styles.textContent}>
                            {/* Song Title */}
                            <Text style={styles.title} numberOfLines={1}>
                                {mediaInfo?.Title || 'No Track Playing'}
                            </Text>

                            {/* Artist */}
                            <Text style={styles.artist} numberOfLines={1}>
                                {mediaInfo?.Artist || 'Unknown Artist'}
                            </Text>

                            {/* Album */}
                            <Text style={styles.album} numberOfLines={1}>
                                {mediaInfo?.Album || 'Unknown Album'}
                            </Text>

                            {/* Media Controls */}
                            <View style={styles.controls}>
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={() => webSocketService.sendCommand('prev')}
                                >
                                    <Ionicons name="play-skip-back" size={20} color="#746e65" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.controlButton, styles.playButton]}
                                    onPress={() => webSocketService.sendCommand('player_toggle')}
                                >
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={24}
                                        color="#fff"
                                        style={{ marginLeft: isPlaying ? 0 : 2 }}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={() => webSocketService.sendCommand('next')}
                                >
                                    <Ionicons name="play-skip-forward" size={20} color="#77726b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <LinearGradient
                            colors={['rgba(51, 65, 85, 0.4)', 'rgba(71, 85, 105, 0.5)', 'rgba(100, 116, 139, 0.6)']}
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

                {/* Bottom Info Bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.infoItem}>
                        {isSpotify ? (
                            <SpotifyIcon size={14} color="#1DB954" />
                        ) : (
                            <Ionicons name={getPlayerIcon(mediaInfo?.Player)} size={14} color={"white"} />
                        )}
                        <Text style={styles.infoText}>
                            {extractPlayerName(mediaInfo?.Player)}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.textDim} />
                        <Text style={styles.infoText}>
                            {"-" + formatTime(remainingTime)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        ...theme.shadows.default,
        position: 'relative',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    card: {
        padding: theme.spacing.l,
        minHeight: 220,
        position: 'relative',
    },
    mainContent: {
        flexDirection: 'row',
        gap: 0,
        marginBottom: theme.spacing.m,
        position: 'relative',
        height: 140,
    },
    artworkContainer: {
        width: 156,
        height: 156,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.glow,
        backgroundColor: '#000',
        position: 'relative',
        zIndex: 1,
    },
    artwork: {
        width: '100%',
        height: '100%',
    },
    placeholderArtwork: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    playingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4ade80',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        paddingLeft: 48,
        marginLeft: 12,
        paddingRight: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        justifyContent: 'space-between',
        position: 'relative',
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    infoBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: theme.borderRadius.m,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    textContent: {
        position: 'relative',
        zIndex: 3,
        justifyContent: 'space-between',
        height: '100%',
        overflow: "visible",
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.3,
        marginBottom: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    artist: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        marginBottom: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    album: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: theme.spacing.s,
    },
    controlButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        ...theme.shadows.glow,
    },
    progressContainer: {
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.m,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    timeText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        fontFamily: 'monospace',
    },
});
