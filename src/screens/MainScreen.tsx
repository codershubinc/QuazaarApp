import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, ImageBackground } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useAppStore } from '../store/useAppStore';
import { webSocketService } from '../services/WebSocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { Paths, File } from 'expo-file-system';

import { Header } from '../components/ui/Header';
import { DateTimeCard } from '../components/time/DateTimeCard';
import { PomodoroCard } from '../components/time/PomodoroCard';
import { NowPlayingCard } from '../components/media/NowPlayingCard';
import { SystemControlsCard } from '../components/system/SystemControlsCard';
import { Toast } from '../components/ui/Toast';
import { SettingsScreen } from './SettingsScreen';
import { LoginScreen } from './LoginScreen';
import { ActivityFeed } from '../components/productivity/ActivityFeed';
import { SystemStatsCard } from '../components/system/SystemStatsCard';
import { TopLangsCard } from '../components/developer/TopLangsCard';
import { WanderingCursor } from '../components/ui/WanderingCursor';
import { CreatorInfo } from '../components/developer/CreatorInfo';

// Helper function to extract YouTube video ID from various URL formats
const getYoutubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^&]+)/,
        /(?:youtube\.com\/embed\/)([^&]+)/,
        /(?:youtube\.com\/v\/)([^&]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};

// Helper function to check if URL is a direct video link
const isDirectVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
        lowerUrl.includes('blob:') ||
        lowerUrl.includes('/video/');
};

export const MainScreen = () => {
    const { width } = useWindowDimensions();
    const isLandscape = width > 600;
    const { isConnected, isConnecting, error, mediaInfo, bluetoothDevices, authToken, setAuthToken, username, backgroundImage, backgroundMediaType, youtubeUrl, setBackgroundImage, setYoutubeUrl } = useAppStore();
    const [currentScreen, setCurrentScreen] = useState<'MAIN' | 'SETTINGS' | 'LOGIN'>('LOGIN');
    const [isLoading, setIsLoading] = useState(true);
    const [cachedVideoUri, setCachedVideoUri] = useState<string | null>(null);

    useEffect(() => {
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('overlay-swipe');
        return () => { NavigationBar.setVisibilityAsync('visible'); };
    }, []);

    useEffect(() => {
        // Check for existing token and background image
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    setAuthToken(token);
                }

                const savedBg = await AsyncStorage.getItem('backgroundImage');
                const savedMediaType = await AsyncStorage.getItem('backgroundMediaType') as 'image' | 'video' | null;
                if (savedBg) {
                    setBackgroundImage(savedBg, savedMediaType);
                }

                const savedYoutubeUrl = await AsyncStorage.getItem('youtubeUrl');
                if (savedYoutubeUrl) {
                    setYoutubeUrl(savedYoutubeUrl);
                }
            } catch (e) {
                console.error("Auth check failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (!authToken) {
            setCurrentScreen('LOGIN');
            return;
        } else {
            if (currentScreen === 'LOGIN') setCurrentScreen('MAIN');
        }

        const connect = async () => {
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';

            // Use authToken as the primary authentication method
            const path = `/ws?deviceId=${encodeURIComponent(authToken)}`;

            const url = `ws://${ip}:${port}${path}`;
            webSocketService.connect(url);
        };
        connect();

        return () => {
            webSocketService.close();
        };
    }, [authToken]);

    // Download and cache direct video URLs
    useEffect(() => {
        const downloadVideo = async () => {
            if (youtubeUrl && isDirectVideoUrl(youtubeUrl)) {
                try {
                    const filename = youtubeUrl.split('/').pop()?.split('?')[0] || 'cached_video.mp4';
                    const file = new File(Paths.cache, filename);

                    // Check if already cached
                    const fileInfo = Paths.info(file.uri);
                    if (fileInfo.exists) {
                        setCachedVideoUri(file.uri);
                        console.log('Using cached video:', file.uri);
                        return;
                    }

                    // Download the video
                    console.log('Downloading video from:', youtubeUrl);
                    const downloadedFile = await File.downloadFileAsync(youtubeUrl, file);

                    setCachedVideoUri(downloadedFile.uri);
                    console.log('Video downloaded and cached:', downloadedFile.uri);
                } catch (error) {
                    console.error('Failed to download video:', error);
                    // Fallback to direct URL (stream without caching)
                    setCachedVideoUri(youtubeUrl);
                }
            } else {
                setCachedVideoUri(null);
            }
        };

        downloadVideo();
    }, [youtubeUrl]);

    if (isLoading) {
        return (
            <LinearGradient
                colors={[theme.colors.background, '#161b33', theme.colors.background]}
                style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
            >
                <Text style={{ color: theme.colors.text }}>Loading...</Text>
            </LinearGradient>
        );
    }

    if (currentScreen === 'LOGIN') {
        return <LoginScreen />;
    }

    if (currentScreen === 'SETTINGS') {
        return <SettingsScreen onBack={() => setCurrentScreen('MAIN')} />;
    }

    const mainContent = (
        <View style={{ flex: 1 }}>
            <Toast />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Header onSettingsClick={() => setCurrentScreen('SETTINGS')} />
                <View style={{
                    flexDirection: isLandscape ? 'row' : 'column', gap: 16, marginBottom: theme.spacing.m, alignItems: 'center', height: 'auto', maxHeight: isLandscape ? 220 : 'auto',
                }}>
                    <DateTimeCard />
                    <SystemControlsCard />
                    <SystemStatsCard />

                </View>

                {isConnecting && !isConnected && (
                    <View style={styles.statusCard}>
                        <Text style={styles.statusText}>Connecting to server...</Text>
                    </View>
                )}

                {error && (
                    <View style={[styles.statusCard, styles.errorCard]}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={isLandscape ? styles.row : styles.column}>
                    <View style={isLandscape ? styles.columnHalf : styles.column}>
                        {mediaInfo && (mediaInfo.Title || mediaInfo.Artist) && <NowPlayingCard />}
                        <CreatorInfo />
                    </View>
                    <View style={isLandscape ? styles.columnHalf : styles.column}>
                        <TopLangsCard username={username || 'codershubinc'} />
                        <ActivityFeed />
                        <View
                            style={{ flexDirection: isLandscape ? 'row' : 'column', gap: theme.spacing.m, width: 'auto', marginBottom: theme.spacing.m }}

                        >

                            <View style={isLandscape ? { flex: 1 } : undefined}>
                                <PomodoroCard />
                            </View>
                        </View>
                        {/* <SystemOutputCard /> */}
                    </View>
                </View>
            </ScrollView>
        </View>
    );

    // Video URL background takes priority (YouTube or Direct Video)
    if (youtubeUrl) {
        // Check if it's a direct video URL
        if (isDirectVideoUrl(youtubeUrl) && cachedVideoUri) {
            return (
                <View style={styles.container}>
                    <Video
                        source={{ uri: cachedVideoUri }}
                        style={styles.backgroundVideo}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={true}
                        volume={0.0}
                        useNativeControls={false}
                        onLoad={(status) => {
                            if (status.isLoaded) {
                                console.log("Video loaded, playing now...");
                            }
                        }}
                        ref={ref => {
                            if (ref) {
                                ref.playAsync();
                            }
                        }}
                    />
                    <View style={styles.overlay} />
                    <View style={styles.contentContainer}>
                        {mainContent}
                    </View>
                    <WanderingCursor />
                </View>
            );
        }

        // Otherwise try YouTube embed
        const videoId = getYoutubeVideoId(youtubeUrl);
        if (videoId) {
            // Use Direct Iframe for higher reliability of autoplay in WebViews
            const youtubeHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                        * { margin: 0; padding: 0; overflow: hidden; box-sizing: border-box; }
                        body, html { background: #000; width: 100%; height: 100%; }
                        .video-container {
                            position: absolute;
                            top: 0; left: 0; width: 100vw; height: 100vh;
                            pointer-events: none;
                        }
                        iframe {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            width: 100vw;
                            height: 56.25vw; /* 16:9 resolution */
                            min-height: 100vh;
                            min-width: 177.77vh; /* 16:9 resolution */
                            transform: translate(-50%, -50%);
                            pointer-events: none;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="video-container">
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&vq=hd1080" 
                            allow="autoplay; encrypted-media"
                            allowfullscreen
                        ></iframe>
                    </div>
                    <script>
                        // Force play via JS API as fallback
                        var iframe = document.querySelector('iframe');
                        
                        setTimeout(() => {
                            if(iframe) {
                                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                            }
                        }, 1000);

                        // Ensure YouTube loop fallback by detecting end state
                        window.addEventListener('message', function(event) {
                            if (event.data) {
                                try {
                                    var data = JSON.parse(event.data);
                                    // 0 means video ended natively
                                    if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
                                        if (iframe) {
                                            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                                        }
                                    }
                                } catch(e) {}
                            }
                        });
                    </script>
                </body>
                </html>
            `;

            return (
                <View style={styles.container}>
                    <WebView
                        source={{ html: youtubeHtml, baseUrl: 'https://www.youtube.com' }}
                        style={styles.backgroundVideo}
                        allowsFullscreenVideo={false}
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        scrollEnabled={false}
                        bounces={false}
                        scalesPageToFit={false}
                        originWhitelist={['*']}
                        mixedContentMode="always"
                        androidLayerType="hardware"
                        cacheEnabled={true}
                        cacheMode="LOAD_CACHE_ELSE_NETWORK"
                    />
                    <View style={styles.overlay} />
                    <View style={styles.contentContainer}>
                        {mainContent}
                    </View>
                    <WanderingCursor />
                </View>
            );
        }
    }

    return backgroundImage ? (
        backgroundMediaType === 'video' ? (
            <View style={styles.container}>
                <Video
                    source={{ uri: backgroundImage }}
                    style={styles.backgroundVideo}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={true}
                    isMuted={true}
                    volume={0.0}
                    useNativeControls={false}
                    onLoad={(status) => {
                        if (status.isLoaded) {
                            console.log("Local video loaded, playing now...");
                        }
                    }}
                    ref={ref => {
                        if (ref) {
                            ref.playAsync();
                        }
                    }}
                />
                <View style={styles.overlay} />
                <View style={styles.contentContainer}>
                    {mainContent}
                </View>
                <WanderingCursor />
            </View>
        ) : (
            <View style={styles.container}>
                <ImageBackground
                    source={{ uri: backgroundImage }}
                    style={styles.backgroundVideo}
                    blurRadius={2}
                />
                <View style={styles.overlay} />
                <View style={styles.contentContainer}>
                    {mainContent}
                </View>
                <WanderingCursor />
            </View>
        )
    ) : (
        <LinearGradient
            colors={[theme.colors.background, '#000000', theme.colors.background]}
            style={styles.container}
        >
            {mainContent}
            <WanderingCursor />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1,
        pointerEvents: 'none',
    },
    contentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    statusCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    errorCard: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    statusText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    column: {
        flexDirection: 'column',
        gap: theme.spacing.m,
    },
    columnHalf: {
        flex: 1,
        gap: theme.spacing.m,
    },
});
