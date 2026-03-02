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
};

const SOCIALS: { icon: any; color: string; label: string; url: string }[] = [
    { icon: 'logo-github', color: '#e2e8f0', label: 'GitHub', url: 'https://github.com/codershubinc' },
    { icon: 'logo-twitter', color: '#1DA1F2', label: 'Twitter', url: 'https://twitter.com/codershubinc' },
    { icon: 'logo-linkedin', color: '#0A66C2', label: 'LinkedIn', url: 'https://linkedin.com/in/codershubinc' },
    { icon: 'logo-instagram', color: '#E1306C', label: 'Instagram', url: 'https://instagram.com/codershubinc' },
    { icon: 'logo-youtube', color: '#FF0000', label: 'YouTube', url: 'https://youtube.com/@codershubinc' },
];

export const CreatorInfo = () => (
    <View style={styles.container}>
        <LinearGradient
            colors={['rgba(99,102,241,0.10)', 'rgba(0,0,0,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />

        {/* Profile row */}
        <TouchableOpacity
            style={styles.row}
            activeOpacity={0.75}
            onPress={() => Linking.openURL(SOCIALS[0].url).catch(() => { })}
        >
            <Image source={{ uri: CREATOR.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.info}>
                <Text style={styles.name}>{CREATOR.name}</Text>
                <View style={styles.subRow}>
                    <Ionicons name="logo-github" size={11} color={theme.colors.textDim} />
                    <Text style={styles.login}>{CREATOR.login}</Text>
                </View>
                <Text style={styles.role}>{CREATOR.role}</Text>
            </View>
            <View style={styles.badge}>
                <Ionicons name="code-slash-outline" size={14} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Social links */}
        <View style={styles.socialsRow}>
            {SOCIALS.map((s) => (
                <TouchableOpacity
                    key={s.label}
                    style={styles.socialBtn}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(s.url).catch(() => { })}
                >
                    <Ionicons name={s.icon} size={18} color={s.color} />
                    <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s + 2,
        gap: theme.spacing.s,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    info: {
        flex: 1,
        gap: 1,
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
        marginTop: 1,
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(99,102,241,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.3)',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        marginHorizontal: theme.spacing.m,
    },
    socialsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        gap: 6,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    socialLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
});
