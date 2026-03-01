import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

interface GithubProfile {
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    html_url: string;
    public_repos: number;
    followers: number;
    following: number;
    location: string | null;
    company: string | null;
    blog: string | null;
    twitter_username: string | null;
}

export const GithubProfileCard = () => {
    const { username } = useAppStore();
    const user = username || 'codershubinc';

    const [profile, setProfile] = useState<GithubProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(() => {
        fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
            headers: { Accept: 'application/vnd.github+json' },
        })
            .then((res) => res.json())
            .then((data: GithubProfile) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('GithubProfileCard fetch failed', err);
                setLoading(false);
            });
    }, [user]);

    useEffect(() => {
        fetchProfile();
        const interval = setInterval(fetchProfile, 1000 * 60 * 10);
        return () => clearInterval(interval);
    }, [fetchProfile]);

    if (loading) {
        return (
            <View style={[styles.card, styles.center]}>
                <Ionicons name="logo-github" size={28} color={theme.colors.textDim} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!profile) return null;

    const openProfile = () => {
        Linking.openURL(profile.html_url).catch(() => { });
    };

    return (
        <View style={styles.cardContainer}>
            {/* Gradient background */}
            <LinearGradient
                colors={['rgba(99,102,241,0.12)', 'rgba(0,0,0,0.0)', 'rgba(30,41,59,0.18)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.card}>
                {/* Header row: avatar + name + GitHub icon */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={openProfile} activeOpacity={0.8}>
                        <Image
                            source={{ uri: profile.avatar_url }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    </TouchableOpacity>

                    <View style={styles.nameBlock}>
                        <Text style={styles.name} numberOfLines={1}>
                            {profile.name || profile.login}
                        </Text>
                        <View style={styles.loginRow}>
                            <Ionicons name="logo-github" size={13} color={theme.colors.textDim} />
                            <Text style={styles.login}>{profile.login}</Text>
                        </View>

                        {/* Meta: location / company */}
                        {(profile.location || profile.company) && (
                            <View style={styles.metaRow}>
                                {profile.location && (
                                    <View style={styles.metaItem}>
                                        <Ionicons name="location-outline" size={12} color={theme.colors.textDim} />
                                        <Text style={styles.metaText} numberOfLines={1}>{profile.location}</Text>
                                    </View>
                                )}
                                {profile.company && (
                                    <View style={styles.metaItem}>
                                        <Ionicons name="business-outline" size={12} color={theme.colors.textDim} />
                                        <Text style={styles.metaText} numberOfLines={1}>
                                            {profile.company.replace(/^@/, '')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* Bio */}
                {profile.bio && (
                    <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <StatPill icon="git-branch-outline" value={profile.public_repos} label="Repos" color="#60A5FA" />
                    <View style={styles.statsSep} />
                    <StatPill icon="people-outline" value={profile.followers} label="Followers" color="#34D399" />
                    <View style={styles.statsSep} />
                    <StatPill icon="person-add-outline" value={profile.following} label="Following" color="#A78BFA" />
                </View>

                {/* Links row */}
                {(profile.blog || profile.twitter_username) && (
                    <View style={styles.linksRow}>
                        {profile.blog && profile.blog !== '' && (
                            <TouchableOpacity
                                style={styles.linkChip}
                                onPress={() => {
                                    const url = profile.blog!.startsWith('http') ? profile.blog! : `https://${profile.blog}`;
                                    Linking.openURL(url).catch(() => { });
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="link-outline" size={12} color={theme.colors.primary} />
                                <Text style={styles.linkText} numberOfLines={1}>{profile.blog}</Text>
                            </TouchableOpacity>
                        )}
                        {profile.twitter_username && (
                            <TouchableOpacity
                                style={styles.linkChip}
                                onPress={() => Linking.openURL(`https://twitter.com/${profile.twitter_username}`).catch(() => { })}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-twitter" size={12} color="#1DA1F2" />
                                <Text style={[styles.linkText, { color: '#1DA1F2' }]}>@{profile.twitter_username}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const StatPill = ({
    icon, value, label, color,
}: {
    icon: any; value: number; label: string; color: string;
}) => (
    <View style={styles.statItem}>
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.statValue, { color }]}>
            {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...theme.shadows.default,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.m,
    },
    card: {
        padding: theme.spacing.m,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 80,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.m,
    },
    loadingText: {
        color: theme.colors.textDim,
        fontSize: 13,
        marginTop: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    nameBlock: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    name: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    login: {
        color: theme.colors.textDim,
        fontSize: 12,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 3,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        color: theme.colors.textDim,
        fontSize: 11,
    },
    bio: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: theme.spacing.s,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: theme.spacing.s,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    statLabel: {
        color: theme.colors.textDim,
        fontSize: 10,
        letterSpacing: 0.3,
    },
    statsSep: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    linksRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: theme.spacing.s,
    },
    linkChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        maxWidth: 200,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 11,
    },
});
