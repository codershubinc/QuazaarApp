import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

const calculateLeetCodeStreak = (calendar: Record<string, number>): number => {
    const timestamps = Object.keys(calendar).map(Number);

    if (timestamps.length === 0) {
        return 0;
    }

    const uniqueDates = Array.from(new Set(
        timestamps.map(ts => {
            const d = new Date(ts * 1000);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        })
    )).sort((a, b) => a - b);

    let currentStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
        if (i > 0 && uniqueDates[i] === uniqueDates[i - 1] + 86400000) {
            tempStreak++;
        } else {
            tempStreak = 1;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (uniqueDates[i] === today.getTime() || uniqueDates[i] === yesterday.getTime()) {
            currentStreak = tempStreak;
        }
    }

    return currentStreak;
};

export const StreakDisplay = () => {
    const { username } = useAppStore();
    const [ghStreak, setGhStreak] = useState<number | null>(null);
    const [lcStreak, setLcStreak] = useState<number | null>(null);
    const [todayContrib, setTodayContrib] = useState<number | null>(null);

    const user = username || 'codershubinc';

    const fetchGithub = useCallback(() => {
        // Fetch Streak
        fetch(`https://github-readme-streak-stats-chi-three.vercel.app?user=${user}&type=json`)
            .then(res => res.json())
            .then(data => {
                if (data.currentStreak && data.currentStreak.length !== undefined) {
                    setGhStreak(data.currentStreak.length);
                }
            })
            .catch(err => console.error("Github streak fetch failed", err));

        // Fetch Today's Contributions
        const todaysDate = new Date().toISOString().split('T')[0];
        fetch(`https://github-contributions-api.deno.dev/${user}.json?flat=true&to=${todaysDate}`, { cache: 'no-cache' })
            .then(res => res.json())
            .then(data => {
                if (data.contributions && data.contributions.length > 0) {
                    const last = data.contributions[data.contributions.length - 1];
                    setTodayContrib(last.contributionCount);
                }
            })
            .catch(err => console.error("Github contributions fetch failed", err));

    }, [user]);

    const fetchLeetCode = useCallback(async () => {
        const query = `
            query userProfileCalendar($username: String!) {
                matchedUser(username: $username) {
                    submissionCalendar
                }
            }
        `;

        try {
            const response = await fetch('https://leetcode.com/graphql', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables: { username: user } }),
            });

            if (response.ok) {
                const result = await response.json();
                const matchedUser = result.data?.matchedUser;
                if (matchedUser && matchedUser.submissionCalendar) {
                    const calendar = JSON.parse(matchedUser.submissionCalendar);
                    setLcStreak(calculateLeetCodeStreak(calendar));
                }
            }
        } catch (error) {
            console.error("LeetCode streak fetch failed", error);
        }
    }, [user]);

    useEffect(() => {
        fetchGithub();
        fetchLeetCode();

        // Refresh every 1 min
        const interval = setInterval(() => {
            fetchGithub();
            fetchLeetCode();
        }, 1000 * 60);

        return () => clearInterval(interval);
    }, [fetchGithub, fetchLeetCode]);

    if (ghStreak === null && lcStreak === null && todayContrib === null) return null;

    return (
        <View style={styles.container}>
            {ghStreak !== null && (
                <View style={styles.item}>
                    <Ionicons name="logo-github" size={14} color={theme.colors.text} />
                    <Text style={styles.text}>{ghStreak}d</Text>
                </View>
            )}

            {todayContrib !== null && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <Ionicons name="git-commit-outline" size={14} color={theme.colors.success} />
                        <Text style={[styles.text, { color: theme.colors.success }]}>{todayContrib}</Text>
                    </View>
                </>
            )}

            {(lcStreak !== null) && <View style={styles.divider} />}

            {lcStreak !== null && (
                <View style={styles.item}>
                    <Ionicons name="code-slash" size={14} color="#FFA116" />
                    <Text style={[styles.text, { color: '#FFA116' }]}>{lcStreak}d</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: 'monospace',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
