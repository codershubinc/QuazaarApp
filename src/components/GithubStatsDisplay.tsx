import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

export const GithubStatsDisplay = () => {
    const { username } = useAppStore();
    const [totalContribs, setTotalContribs] = useState<number | null>(null);
    const [ghStats, setGhStats] = useState<{ totalStars?: number, rank?: { level: string } } | null>(null);

    const user = username || 'codershubinc';

    const fetchStats = useCallback(() => {
        // Fetch Total Contributions (from streak stats API as it's reliable for this)
        fetch(`https://github-readme-streak-stats-chi-three.vercel.app?user=${user}&type=json`)
            .then(res => res.json())
            .then(data => {
                if (data.totalContributions !== undefined) {
                    setTotalContribs(data.totalContributions);
                }
            })
            .catch(err => console.error("Github total contribs fetch failed", err));

        // Fetch Stats (Stars & Rank)
        fetch(`https://github-readme-states-repo-self-inst.vercel.app/api/json-stats?username=${user}`)
            .then(res => res.json())
            .then(data => {
                setGhStats(data);
            })
            .catch(err => console.error("Github stats fetch failed", err));
    }, [user]);

    useEffect(() => {
        fetchStats();
        // Refresh every 5 mins for general stats
        const interval = setInterval(fetchStats, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (totalContribs === null && !ghStats) return null;

    const getRankColor = (level: string) => {
        if (!level) return theme.colors.text;
        if (level.includes('S')) return '#FACC15'; // yellow-400
        if (level.includes('A')) return '#34D399'; // emerald-400
        if (level.includes('B')) return '#60A5FA'; // blue-400
        return theme.colors.textDim;
    };

    return (
        <View style={styles.container}>
            {totalContribs !== null && (
                <View style={styles.item}>
                    <Ionicons name="layers-outline" size={14} color="#60A5FA" />
                    <Text style={[styles.text, { color: '#60A5FA' }]}>{totalContribs}</Text>
                </View>
            )}

            {ghStats?.rank?.level && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <Ionicons name="trophy-outline" size={14} color={getRankColor(ghStats.rank.level)} />
                        <Text style={[styles.text, { color: getRankColor(ghStats.rank.level) }]}>{ghStats.rank.level}</Text>
                    </View>
                </>
            )}

            {ghStats?.totalStars !== undefined && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <Ionicons name="star" size={14} color="#FACC15" />
                        <Text style={[styles.text, { color: '#FACC15' }]}>{ghStats.totalStars}</Text>
                    </View>
                </>
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
