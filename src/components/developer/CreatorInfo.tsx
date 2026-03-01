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
    github: 'https://github.com/codershubinc',
    role: 'Creator & Developer',
};

export const CreatorInfo = () => (
    <View style={styles.container}>
        <LinearGradient
            colors={['rgba(99,102,241,0.10)', 'rgba(0,0,0,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
            style={styles.row}
            activeOpacity={0.75}
            onPress={() => Linking.openURL(CREATOR.github).catch(() => { })}
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
});
