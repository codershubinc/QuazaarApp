import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from '../services/WebSocketService';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/useAppStore';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export const SettingsScreen = ({ onBack }: { onBack: () => void }) => {
    const [activeTab, setActiveTab] = useState<'CONNECTION' | 'BACKGROUND' | 'BUDDY' | 'WIDGETS'>('CONNECTION');
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const [path, setPath] = useState('');
    const [youtubeInput, setYoutubeInput] = useState('');
    const { backgroundImage, backgroundMediaType, youtubeUrl, setBackgroundImage, setYoutubeUrl, buddyType, setBuddyType, buddyEnabled, setBuddyEnabled, nowPlayingEnabled, pomodoroEnabled, activityFeedEnabled, topLangsEnabled, creatorInfoEnabled, systemStatsEnabled, setWidgetEnabled } = useAppStore();

    useEffect(() => {
        const loadSettings = async () => {
            setIp(await AsyncStorage.getItem('ip') || '192.168.1.110');
            setPort(await AsyncStorage.getItem('port') || '8765');
            setPath(await AsyncStorage.getItem('path') || '/ws?deviceId=$2a$10$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2');

            // Load background image from storage
            const savedBg = await AsyncStorage.getItem('backgroundImage');
            const savedMediaType = await AsyncStorage.getItem('backgroundMediaType') as 'image' | 'video' | null;
            if (savedBg) {
                setBackgroundImage(savedBg, savedMediaType);
            }

            // Load YouTube URL from storage
            const savedYoutubeUrl = await AsyncStorage.getItem('youtubeUrl');
            if (savedYoutubeUrl) {
                setYoutubeUrl(savedYoutubeUrl);
                setYoutubeInput(savedYoutubeUrl);
            }

            // Load buddy type
            const savedBuddy = await AsyncStorage.getItem('buddyType') as 'robo' | 'ironman' | null;
            if (savedBuddy) setBuddyType(savedBuddy);

            // Load buddy enabled
            const savedBuddyEnabled = await AsyncStorage.getItem('buddyEnabled');
            if (savedBuddyEnabled !== null) setBuddyEnabled(savedBuddyEnabled === 'true');

            // Load widget visibility
            const widgetKeys = ['nowPlayingEnabled', 'pomodoroEnabled', 'activityFeedEnabled', 'topLangsEnabled', 'creatorInfoEnabled', 'systemStatsEnabled'];
            for (const key of widgetKeys) {
                const val = await AsyncStorage.getItem(key);
                if (val !== null) setWidgetEnabled(key, val === 'true');
            }
        };
        loadSettings();
    }, []);

    const handleConnect = async () => {
        await AsyncStorage.setItem('ip', ip);
        await AsyncStorage.setItem('port', port);
        await AsyncStorage.setItem('path', path);
        const url = `ws://${ip}:${port}${path}`;
        webSocketService.connect(url);
        onBack();
    };

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photo library');
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setBackgroundImage(uri, 'image');
            await AsyncStorage.setItem('backgroundImage', uri);
            await AsyncStorage.setItem('backgroundMediaType', 'image');
        }
    };

    const pickVideo = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your media library');
            return;
        }

        // Pick video
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setBackgroundImage(uri, 'video');
            await AsyncStorage.setItem('backgroundImage', uri);
            await AsyncStorage.setItem('backgroundMediaType', 'video');
        }
    };

    const removeBackground = async () => {
        setBackgroundImage(null, null);
        await AsyncStorage.removeItem('backgroundImage');
        await AsyncStorage.removeItem('backgroundMediaType');
    };

    const saveYoutubeUrl = async () => {
        if (!youtubeInput.trim()) {
            Alert.alert('Error', 'Please enter a valid YouTube URL');
            return;
        }
        setYoutubeUrl(youtubeInput.trim());
        await AsyncStorage.setItem('youtubeUrl', youtubeInput.trim());
        Alert.alert('Success', 'YouTube background saved!');
    };

    const removeYoutubeUrl = async () => {
        setYoutubeUrl(null);
        setYoutubeInput('');
        await AsyncStorage.removeItem('youtubeUrl');
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, '#161b33', theme.colors.background]}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SETTINGS</Text>
            </View>

            <View style={styles.splitContainer}>
                {/* Sidebar */}
                <View style={styles.sidebar}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'CONNECTION' && styles.activeTabItem]}
                        onPress={() => setActiveTab('CONNECTION')}
                    >
                        <Ionicons name="server-outline" size={20} color={activeTab === 'CONNECTION' ? theme.colors.secondary : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'CONNECTION' && styles.activeTabText]}>Connection</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'BACKGROUND' && styles.activeTabItem]}
                        onPress={() => setActiveTab('BACKGROUND')}
                    >
                        <Ionicons name="image-outline" size={20} color={activeTab === 'BACKGROUND' ? theme.colors.secondary : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'BACKGROUND' && styles.activeTabText]}>Background</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'BUDDY' && styles.activeTabItem]}
                        onPress={() => setActiveTab('BUDDY')}
                    >
                        <Ionicons name="bonfire-outline" size={20} color={activeTab === 'BUDDY' ? theme.colors.secondary : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'BUDDY' && styles.activeTabText]}>Buddy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'WIDGETS' && styles.activeTabItem]}
                        onPress={() => setActiveTab('WIDGETS')}
                    >
                        <Ionicons name="grid-outline" size={20} color={activeTab === 'WIDGETS' ? theme.colors.secondary : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'WIDGETS' && styles.activeTabText]}>Widgets</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentInner}>
                    {activeTab === 'WIDGETS' ? (
                        <LinearGradient
                            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="grid-outline" size={24} color={theme.colors.secondary} />
                                <Text style={styles.cardTitle}>Visible Widgets</Text>
                            </View>

                            {([
                                { key: 'nowPlayingEnabled', label: 'Now Playing', desc: 'Music / media player card', icon: 'musical-notes-outline', value: nowPlayingEnabled },
                                { key: 'pomodoroEnabled', label: 'Pomodoro Timer', desc: 'Focus & break timer', icon: 'timer-outline', value: pomodoroEnabled },
                                { key: 'activityFeedEnabled', label: 'Activity Feed', desc: 'Recent developer activity', icon: 'pulse-outline', value: activityFeedEnabled },
                                { key: 'topLangsEnabled', label: 'Top Languages', desc: 'GitHub language stats', icon: 'code-slash-outline', value: topLangsEnabled },
                                { key: 'creatorInfoEnabled', label: 'Creator Info', desc: 'Profile & GitHub stats', icon: 'person-outline', value: creatorInfoEnabled },
                                { key: 'systemStatsEnabled', label: 'System Stats', desc: 'CPU, RAM & system info', icon: 'hardware-chip-outline', value: systemStatsEnabled },
                            ] as const).map(({ key, label, desc, icon, value }) => (
                                <View key={key} style={styles.buddyToggleRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <Ionicons name={icon as any} size={20} color={value ? theme.colors.secondary : theme.colors.textDim} />
                                        <View>
                                            <Text style={styles.buddyToggleLabel}>{label}</Text>
                                            <Text style={styles.buddyToggleDesc}>{desc}</Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={value}
                                        onValueChange={async (val) => {
                                            setWidgetEnabled(key, val);
                                            await AsyncStorage.setItem(key, val.toString());
                                        }}
                                        trackColor={{ false: '#333', true: theme.colors.secondary }}
                                        thumbColor={value ? theme.colors.primary : '#888'}
                                    />
                                </View>
                            ))}

                            <Text style={styles.note}>💡 Toggle widgets on/off to customise your home screen.</Text>
                        </LinearGradient>
                    ) : activeTab === 'CONNECTION' ? (
                        <LinearGradient
                            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="server-outline" size={24} color={theme.colors.secondary} />
                                <Text style={styles.cardTitle}>Connection</Text>
                            </View>

                            <Text style={styles.label}>IP Address</Text>
                            <TextInput
                                style={styles.input}
                                value={ip}
                                onChangeText={setIp}
                                placeholder="192.168.1.110"
                                placeholderTextColor={theme.colors.textDim}
                            />

                            <Text style={styles.label}>Port</Text>
                            <TextInput
                                style={styles.input}
                                value={port}
                                onChangeText={setPort}
                                placeholder="8765"
                                placeholderTextColor={theme.colors.textDim}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Path</Text>
                            <TextInput
                                style={styles.input}
                                value={path}
                                onChangeText={setPath}
                                placeholder="/ws"
                                placeholderTextColor={theme.colors.textDim}
                            />

                            <TouchableOpacity style={styles.button} onPress={handleConnect}>
                                <LinearGradient
                                    colors={[theme.colors.secondary, theme.colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>Connect</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    ) : activeTab === 'BUDDY' ? (
                        <LinearGradient
                            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.card}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="bonfire-outline" size={24} color={theme.colors.secondary} />
                                <Text style={styles.cardTitle}>Wandering Buddy</Text>
                            </View>

                            <View style={styles.buddyToggleRow}>
                                <View>
                                    <Text style={styles.buddyToggleLabel}>Enable Buddy</Text>
                                    <Text style={styles.buddyToggleDesc}>Show wandering buddy on screen</Text>
                                </View>
                                <Switch
                                    value={buddyEnabled}
                                    onValueChange={async (val) => {
                                        setBuddyEnabled(val);
                                        await AsyncStorage.setItem('buddyEnabled', val.toString());
                                    }}
                                    trackColor={{ false: '#333', true: theme.colors.secondary }}
                                    thumbColor={buddyEnabled ? theme.colors.primary : '#888'}
                                />
                            </View>

                            <Text style={[styles.label, !buddyEnabled && { opacity: 0.4 }]}>Choose your screen companion</Text>

                            <View style={[styles.buddyGrid, !buddyEnabled && { opacity: 0.4 }]} pointerEvents={buddyEnabled ? 'auto' : 'none'}>
                                {/* Robo Buddy */}
                                <TouchableOpacity
                                    style={[styles.buddyCard, buddyType === 'robo' && styles.buddyCardActive]}
                                    onPress={async () => {
                                        setBuddyType('robo');
                                        await AsyncStorage.setItem('buddyType', 'robo');
                                    }}
                                >
                                    <View style={styles.buddyPreview}>
                                        <Text style={styles.buddyEmoji}>🤖</Text>
                                    </View>
                                    <Text style={[styles.buddyName, buddyType === 'robo' && styles.buddyNameActive]}>RoboSkel</Text>
                                    <Text style={styles.buddyDesc}>{'Colorful robot\nwith laser trail'}</Text>
                                    {buddyType === 'robo' && (
                                        <View style={styles.buddyBadge}>
                                            <Ionicons name="checkmark" size={12} color="#000" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Iron Man Buddy */}
                                <TouchableOpacity
                                    style={[styles.buddyCard, buddyType === 'ironman' && styles.buddyCardActive, buddyType === 'ironman' && { borderColor: '#FFD700' }]}
                                    onPress={async () => {
                                        setBuddyType('ironman');
                                        await AsyncStorage.setItem('buddyType', 'ironman');
                                    }}
                                >
                                    <View style={[styles.buddyPreview, { backgroundColor: 'rgba(139,0,0,0.3)' }]}>
                                        <Text style={styles.buddyEmoji}>🦾</Text>
                                    </View>
                                    <Text style={[styles.buddyName, buddyType === 'ironman' && { color: '#FFD700' }]}>Iron Man</Text>
                                    <Text style={styles.buddyDesc}>{'Red & gold armor\nwith gold trail'}</Text>
                                    {buddyType === 'ironman' && (
                                        <View style={[styles.buddyBadge, { backgroundColor: '#FFD700' }]}>
                                            <Ionicons name="checkmark" size={12} color="#000" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.note, !buddyEnabled && { opacity: 0.4 }]}>
                                💡 Your buddy wanders in the background, appears on touch, and occasionally says hello!
                            </Text>
                        </LinearGradient>
                    ) : (
                        <View style={styles.backgroundTabContainer}>
                            <LinearGradient
                                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.card}
                            >
                                <View style={styles.cardHeader}>
                                    <Ionicons name="image-outline" size={24} color={theme.colors.secondary} />
                                    <Text style={styles.cardTitle}>Local Background</Text>
                                </View>

                                <Text style={styles.label}>Main Screen Background (Image or Video)</Text>

                                {backgroundImage && (
                                    <View style={styles.imagePreview}>
                                        {backgroundMediaType === 'video' ? (
                                            <Video
                                                source={{ uri: backgroundImage }}
                                                style={styles.previewImage}
                                                resizeMode={ResizeMode.COVER}
                                                shouldPlay={true}
                                                isLooping={true}
                                                isMuted={true}
                                                volume={0.0}
                                                ref={ref => {
                                                    if (ref) ref.playAsync();
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                source={{ uri: backgroundImage }}
                                                style={styles.previewImage}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <Text style={styles.mediaTypeLabel}>
                                            {backgroundMediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={pickImage}>
                                        <LinearGradient
                                            colors={[theme.colors.secondary, theme.colors.primary]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.buttonGradient}
                                        >
                                            <Ionicons name="images" size={20} color={theme.colors.background} style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>Image</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={pickVideo}>
                                        <LinearGradient
                                            colors={[theme.colors.secondary, theme.colors.primary]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.buttonGradient}
                                        >
                                            <Ionicons name="videocam" size={20} color={theme.colors.background} style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>Video</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {backgroundImage && (
                                        <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={removeBackground}>
                                            <LinearGradient
                                                colors={['#ff6b6b', '#ee5a52']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.buttonGradient}
                                            >
                                                <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
                                                <Text style={[styles.buttonText, { color: '#fff' }]}>Remove</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </LinearGradient>

                            <LinearGradient
                                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.card}
                            >
                                <View style={styles.cardHeader}>
                                    <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                                    <Text style={styles.cardTitle}>Remote Background</Text>
                                </View>

                                <Text style={styles.label}>Video URL (YouTube or Direct Link)</Text>
                                <Text style={styles.hint}>YouTube: https://youtube.com/watch?v=... OR Direct MP4: https://example.com/video.mp4</Text>

                                <TextInput
                                    style={styles.input}
                                    value={youtubeInput}
                                    onChangeText={setYoutubeInput}
                                    placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                                    placeholderTextColor={theme.colors.textDim}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                                {youtubeUrl && (
                                    <View style={styles.youtubePreview}>
                                        <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                                        <Text style={styles.youtubeActive}>
                                            {youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')
                                                ? 'YouTube background active'
                                                : 'Video URL background active'}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={saveYoutubeUrl}>
                                        <LinearGradient
                                            colors={['#FF0000', '#CC0000']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.buttonGradient}
                                        >
                                            <Ionicons name="videocam" size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={[styles.buttonText, { color: '#fff' }]}>Save Video URL</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {youtubeUrl && (
                                        <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={removeYoutubeUrl}>
                                            <LinearGradient
                                                colors={['#ff6b6b', '#ee5a52']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.buttonGradient}
                                            >
                                                <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
                                                <Text style={[styles.buttonText, { color: '#fff' }]}>Remove</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text style={styles.note}>
                                    💡 Video URL background will override image/video file backgrounds. Direct video links work better than YouTube embeds.
                                </Text>
                            </LinearGradient>
                        </View>
                    )}
                </ScrollView>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingTop: theme.spacing.xl,
    },
    backButton: {
        padding: theme.spacing.s,
        marginRight: theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.m,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        letterSpacing: 2,
    },
    splitContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 120,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        paddingTop: theme.spacing.m,
    },
    tabItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.s,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
        gap: theme.spacing.s,
    },
    activeTabItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderLeftColor: theme.colors.secondary,
    },
    tabText: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeTabText: {
        color: theme.colors.secondary,
    },
    mainContent: {
        flex: 1,
    },
    mainContentInner: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    backgroundTabContainer: {
        gap: theme.spacing.m,
    },
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.default,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        gap: theme.spacing.s,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
        fontSize: 14,
        marginLeft: theme.spacing.s,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    button: {
        marginTop: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.glow,
    },
    buttonGradient: {
        padding: theme.spacing.m,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    mediaTypeLabel: {
        position: 'absolute',
        top: theme.spacing.s,
        right: theme.spacing.s,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.s,
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginTop: theme.spacing.s,
    },
    flexButton: {
        flex: 1,
    },
    hint: {
        color: theme.colors.textDim,
        fontSize: 12,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.s,
        fontStyle: 'italic',
    },
    youtubePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
    },
    youtubeActive: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: '600',
    },
    note: {
        color: theme.colors.textDim,
        fontSize: 11,
        marginTop: theme.spacing.m,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    buddyToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    buddyToggleLabel: {
        color: theme.colors.text,
        fontSize: 15,
        fontFamily: 'monospace',
        fontWeight: '600',
    },
    buddyToggleDesc: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontFamily: 'monospace',
        marginTop: 2,
    },
    buddyGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        marginBottom: 4,
    },
    buddyCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center',
        padding: 14,
        position: 'relative',
    },
    buddyCardActive: {
        borderColor: theme.colors.secondary,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    buddyPreview: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(66,133,244,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buddyEmoji: {
        fontSize: 30,
    },
    buddyName: {
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    buddyNameActive: {
        color: theme.colors.secondary,
    },
    buddyDesc: {
        color: theme.colors.textDim,
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },
    buddyBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
