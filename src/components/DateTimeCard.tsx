import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { FlipClock } from './FlipClock';

export const DateTimeCard = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 60000); // Update date every minute is enough
        return () => clearInterval(timer);
    }, []);

    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <LinearGradient
            colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>
                <View style={styles.dateContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.secondary} />
                        <Text style={styles.dateText}>{dateString}</Text>
                    </View>
                </View>
                <View style={styles.rightContainer}>
                    <FlipClock />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.m,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
});
