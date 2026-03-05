import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

const CREATOR = {
    name: 'Swapnil Ingle',
    login: 'codershubinc',
    avatar: 'https://github.com/codershubinc.png',
    role: 'Creator & Developer',
    url: 'https://github.com/codershubinc',
};

const SOCIALS: { icon: any; color: string; label: string; url: string }[] = [
    { icon: 'logo-github', color: '#e2e8f0', label: 'github.com/codershubinc', url: 'https://github.com/codershubinc' },
    { icon: 'logo-twitter', color: '#1DA1F2', label: 'x.com/codershubinc', url: 'https://twitter.com/codershubinc' },
    { icon: 'logo-linkedin', color: '#0A66C2', label: 'linkedin.com/in/codershubinc', url: 'https://linkedin.com/in/codershubinc' },
    { icon: 'logo-instagram', color: '#E1306C', label: 'instagram.com/codershubinc', url: 'https://instagram.com/codershubinc' },
    { icon: 'logo-youtube', color: '#FF0000', label: 'youtube.com/@codershubinc', url: 'https://youtube.com/@codershubinc' },
];

export const CreatorInfo = () => (
    <LinearGradient
        colors={['rgba(99,102,241,0.10)', 'rgba(0,0,0,0.0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
    >
        {/* Left: Avatar + name */}
        <TouchableOpacity style={styles.profile} activeOpacity={0.75} onPress={() => Linking.openURL(CREATOR.url).catch(() => { })}>
            <Image source={{ uri: CREATOR.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.info}>
                <Text style={styles.name}>{CREATOR.name}</Text>
                <View style={styles.subRow}>
                    <Ionicons name="logo-github" size={11} color={theme.colors.textDim} />
                    <Text style={styles.login}>{CREATOR.login}</Text>
                </View>
                <Text style={styles.role}>{CREATOR.role}</Text>
            </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right: Social links */}
        <View style={styles.socials}>
            {SOCIALS.map((s) => (
                <TouchableOpacity
                    key={s.label}
                    style={styles.socialRow}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(s.url).catch(() => { })}
                >
                    <Ionicons name={s.icon} size={14} color={s.color} />
                    <Text style={[styles.socialLink, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        gap: theme.spacing.m,
        alignItems: 'flex-start',
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        flex: 0,
        minWidth: 140,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    info: {
        gap: 2,
    },
    name: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    login: {
        color: theme.colors.textDim,
        fontSize: 11,
    },
    role: {
        color: theme.colors.primary,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    divider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    socials: {
        flex: 1,
        gap: 6,
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    socialLink: {
        fontSize: 11,
        fontFamily: 'monospace',
    },
});

