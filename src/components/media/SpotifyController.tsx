import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { SpotifyIcon } from '../helper/SpotifyIcon';

const SPOTIFY_PACKAGE = 'com.spotify.music';
const SPOTIFY_URI = 'spotify:';

type SpotifyStatus = 'checking' | 'installed' | 'not_installed';

async function isSpotifyInstalled(): Promise<boolean> {
    try {
        const canOpen = await Linking.canOpenURL(SPOTIFY_URI);
        return canOpen;
    } catch {
        return true;
    }
}

export const SpotifyController: React.FC = () => {
    const { showToast } = useAppStore();
    const [status, setStatus] = useState<SpotifyStatus>('checking');
    const [launching, setLaunching] = useState(false);

    const checkSpotify = useCallback(async () => {
        setStatus('checking');
        const installed = await isSpotifyInstalled();
        setStatus(installed ? 'installed' : 'not_installed');
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            checkSpotify();
        }
    }, [checkSpotify]);

    const handleLaunch = async () => {
        setLaunching(true);
        try {
            await Linking.openURL(SPOTIFY_URI);
            setStatus('installed');
            showToast('Spotify launched in background', 'success');
        } catch (e: any) {
            const msg: string = e?.message ?? '';
            if (msg.includes('No Activity') || msg.includes('ActivityNotFoundException')) {
                setStatus('not_installed');
                showToast('Spotify is not installed', 'error');
            } else {
                showToast('Failed to launch Spotify', 'error');
            }
        } finally {
            setLaunching(false);
        }
    };

    if (Platform.OS !== 'android') return null;

    const statusColor =
        status === 'installed' ? '#1DB954' :
            status === 'not_installed' ? theme.colors.error :
                theme.colors.textDim;

    const statusLabel =
        status === 'installed' ? 'INSTALLED' :
            status === 'not_installed' ? 'NOT FOUND' :
                'CHECKING...';

    const statusIcon =
        status === 'installed' ? 'checkmark-circle' :
            status === 'not_installed' ? 'close-circle' :
                'ellipsis-horizontal-circle';

    return (
        <View style={styles.container}>
            {/* Status Badge */}
            <View style={styles.statusRow}>
                <SpotifyIcon size={13} color="#1DB954" />
                <Text style={styles.labelText}>Spotify</Text>
                <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                    <Ionicons name={statusIcon as any} size={10} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
                <TouchableOpacity onPress={checkSpotify} style={styles.refreshBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="refresh" size={11} color={theme.colors.textDim} />
                </TouchableOpacity>
            </View>

            {/* Launch Button */}
            <TouchableOpacity
                style={[
                    styles.launchButton,
                    launching && styles.launchButtonActive,
                ]}
                onPress={handleLaunch}
                disabled={launching || status === 'checking'}
                activeOpacity={0.75}
            >
                <MaterialCommunityIcons
                    name="play-speed"
                    size={13}
                    color={status === 'not_installed' ? theme.colors.textDim : '#1DB954'}
                />
                <Text style={[
                    styles.launchText,
                    status === 'not_installed' && { color: theme.colors.textDim },
                ]}>
                    {launching ? 'LAUNCHING...' : 'RUN IN BG'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 6,
        paddingHorizontal: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    labelText: {
        fontSize: 10,
        color: theme.colors.textDim,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    statusText: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    refreshBtn: {
        padding: 2,
    },
    launchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(29, 185, 84, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(29, 185, 84, 0.35)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    launchButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    launchButtonActive: {
        backgroundColor: 'rgba(29, 185, 84, 0.25)',
    },
    launchText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#1DB954',
        letterSpacing: 0.5,
    },
});
