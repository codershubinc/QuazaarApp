import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, LayoutAnimation, ScrollView } from 'react-native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// --- Types ---
interface LangStats {
    name: string;
    color: string;
    size: number;
    count: number;
}
type LangsResponse = Record<string, LangStats>;

// --- Helpers ---
const getLangIcon = (langName: string) => {
    const n = langName.toLowerCase();
    const map: Record<string, string> = {
        'c#': 'csharp', 'c++': 'cplusplus', 'css': 'css3', 'html': 'html5',
        'shell': 'bash', 'vue': 'vuejs', 'jupyter notebook': 'jupyter',
        'vim script': 'vim', 'scss': 'sass',
    };
    const slug = map[n] || n.replace(/\s+/g, '');
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
};

const getShortName = (name: string) => {
    const map: Record<string, string> = {
        'JavaScript': 'JS', 'TypeScript': 'TS', 'Python': 'PY',
        'Java': 'JV', 'C#': 'C#', 'C++': 'CPP', 'HTML': 'HTML',
        'CSS': 'CSS', 'Rust': 'RS', 'Go': 'GO', 'Shell': 'SH',
        'Vue': 'VUE', 'React': 'RCT', 'Dart': 'DT', 'Kotlin': 'KT',
        'Swift': 'SW', 'Ruby': 'RB', 'PHP': 'PHP'
    };
    return map[name] || name.substring(0, 3).toUpperCase();
};

// --- Component ---
export const TopLangsCard = ({ username }: { username: string }) => {
    const [langs, setLangs] = useState<LangStats[]>([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = 'https://github-readme-states-repo-self-inst.vercel.app';

    useEffect(() => {
        if (!username) return;

        fetch(`${baseUrl}/api/json-top-langs?username=${username}`)
            .then((res) => res.json())
            .then((data: LangsResponse) => {
                const langArray = Object.values(data);
                langArray.sort((a, b) => b.size - a.size);

                // Animate the bars appearing
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                setLangs(langArray);
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [username]);

    if (loading) {
        return (
            <View style={[styles.card, styles.centerContainer]}>
                <Ionicons name="code-slash" size={24} color={theme.colors.textDim} />
                <Text style={styles.loadingText}>Analyzing repo data...</Text>
            </View>
        );
    }

    if (langs.length === 0) {
        return (
            <View style={[styles.card, styles.centerContainer]}>
                <Text style={styles.loadingText}>No Language Data</Text>
            </View>
        );
    }

    // Limit to 5 for the best visual fit on mobile
    const top5 = langs.slice(0, 5);
    const remaining = langs.slice(5);
    const totalSize = langs.reduce((acc, curr) => acc + curr.size, 0);

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="pie-chart-outline" size={14} color={theme.colors.secondary} />
                    <Text style={styles.headerTitle}>TOP LANGUAGES</Text>
                </View>
                {/* Optional: Show total KB/MB size or just a decorative badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>TOTAL: {langs.length}</Text>
                </View>
            </View>

            {/* Main Content: Bars and Remaining Languages */}
            <View style={styles.mainContent}>
                {/* Bars Grid */}
                <View style={styles.chartContainer}>
                    {top5.map((lang, index) => {
                        const percent = (lang.size / totalSize) * 100;
                        // Ensure bar is at least 15% height so icon fits, max 100%
                        const visualHeight = Math.min(Math.max(percent, 18), 100);
                        const langColor = lang.color || theme.colors.primary;

                        return (
                            <View key={lang.name} style={styles.columnWrapper}>
                                {/* Percentage Label Top */}
                                <Text style={styles.percentText}>{percent.toFixed(1)}%</Text>

                                {/* The Pill Track */}
                                <View style={styles.track}>
                                    {/* The Colorful Fill */}
                                    <LinearGradient
                                        colors={[langColor, `${langColor}80`]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={[styles.fill, { height: `${visualHeight}%` }]}
                                    />

                                    {/* Icon at Bottom of Pill */}
                                    <View style={styles.iconContainer}>
                                        <Image
                                            source={{ uri: getLangIcon(lang.name) }}
                                            style={styles.icon}
                                            contentFit="contain"
                                        />
                                    </View>
                                </View>

                                {/* Language Name Footer */}
                                <Text style={styles.langName}>{getShortName(lang.name)}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Remaining Languages List */}
                {remaining.length > 0 && (
                    <View style={styles.remainingContainer}>
                        <Text style={styles.remainingTitle}>Others</Text>
                        <ScrollView
                            style={styles.remainingScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {remaining.map((lang, index) => {
                                const percent = (lang.size / totalSize) * 100;
                                return (
                                    <View key={lang.name} style={styles.remainingItem}>
                                        <View style={[styles.colorDot, { backgroundColor: lang.color || theme.colors.primary }]} />
                                        <Text style={styles.remainingLangName} numberOfLines={1}>
                                            {lang.name}
                                        </Text>
                                        <Text style={styles.remainingPercent}>{percent.toFixed(1)}%</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: 16,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
    },
    centerContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        color: theme.colors.textSecondary,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        color: theme.colors.textDim,
        fontSize: 9,
        fontWeight: '600',
    },
    mainContent: {
        flexDirection: 'row',
        gap: 8,
        overflow: 'hidden',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140, // Fixed height for the chart area
        flex: 1,
        overflow: 'hidden',
    },
    columnWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        flex: 1, // Distribute width evenly
        gap: 6,
        minWidth: 0, // Allow flex shrinking
        maxWidth: 60, // Prevent over-expansion
    },
    percentText: {
        color: theme.colors.text,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginBottom: 2,
        textAlign: 'center',
    },
    track: {
        width: 38, // Slim pill width
        flex: 1, // Fill remaining height
        backgroundColor: '#2C2C2E', // Dark track color
        borderRadius: 19,
        overflow: 'hidden',
        justifyContent: 'flex-end', // Align fill to bottom
        position: 'relative',
    },
    fill: {
        width: '100%',
        borderRadius: 19, // Match track radius
    },
    iconContainer: {
        position: 'absolute',
        bottom: 4,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
    },
    icon: {
        width: 18,
        height: 18,
    },
    langName: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    remainingContainer: {
        width: 110,
        paddingLeft: 10,
        paddingRight: 4,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        paddingVertical: 8,
        flexShrink: 0, // Don't shrink below 110px
        overflow: 'hidden',
    },
    remainingTitle: {
        color: theme.colors.textSecondary,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    remainingScroll: {
        maxHeight: 120,
    },
    remainingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        gap: 6,
        paddingVertical: 2,
    },
    colorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        flexShrink: 0,
    },
    remainingLangName: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 9,
        fontWeight: '500',
        flex: 1,
    },
    remainingPercent: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 8,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: '600',
        minWidth: 30,
        textAlign: 'right',
    },
});