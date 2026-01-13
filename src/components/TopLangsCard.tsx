import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface LangStats { name: string; color: string; size: number; count: number; }
type LangsResponse = Record<string, LangStats>;

const getLangIcon = (langName: string) => {
    const n = langName.toLowerCase();
    const map: Record<string, string> = {
        'c#': 'csharp', 'c++': 'cplusplus', 'css': 'css3', 'html': 'html5',
        'shell': 'bash', 'vue': 'vuejs', 'jupyter notebook': 'jupyter', 'vim script': 'vim',
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

export const TopLangsCard = ({ username }: { username: string }) => {
    const [langs, setLangs] = useState<LangStats[]>([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = 'https://github-readme-states-repo-self-inst.vercel.app';

    useEffect(() => {
        if (!username) return;

        // Fetch top langs
        fetch(`${baseUrl}/api/json-top-langs?username=${username}`)
            .then((res) => res.json())
            .then((data: LangsResponse) => {
                const langArray = Object.values(data);
                langArray.sort((a, b) => b.size - a.size);
                setLangs(langArray); // No animation needed for simple initial load
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [username]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
        );
    }

    if (langs.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>No Language Data Found</Text>
            </View>
        );
    }

    const top5 = langs.slice(0, 7);
    const totalSize = langs.reduce((acc, curr) => acc + curr.size, 0);

    // Create a rich background gradient based on top languages
    // We take the top 3 colors, and blend them
    const bgColors = top5.slice(0, 3).map(l => l.color || theme.colors.primary);
    // Ensure we have at least 2 colors and they are valid
    while (bgColors.length < 2) {
        bgColors.push(theme.colors.surfaceHighlight);
    }

    return (
        <View style={styles.container}>
            {/* Ambient Background Gradient */}
            {/* <LinearGradient
                colors={bgColors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.6, 1].slice(0, bgColors.length) as [number, number, ...number[]]}
                style={[StyleSheet.absoluteFill, { opacity: 0.15, borderRadius: theme.borderRadius.l }]}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={[StyleSheet.absoluteFill, { borderRadius: theme.borderRadius.l }]}
            /> */}

            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Ionicons name="bar-chart" size={14} color={theme.colors.secondary} />
                    <Text style={styles.headerText}>LANGUAGE STATS</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>TOP 5</Text>
                </View>
            </View>

            {/* Chart Area */}
            <View style={styles.chartContainer}>
                {top5.map((lang, index) => {
                    const percent = (lang.size / totalSize) * 100;
                    // Logarithmic-like scaling for better visualization of smaller values
                    // visualPercent = (percent + offset) scaled to max
                    const visualHeight = Math.max(percent, 15);

                    return (
                        <View key={lang.name} style={styles.barColumn}>
                            {/* Floating Value Bubble */}
                            <View style={[styles.valueBubble, { borderColor: lang.color || theme.colors.border }]}>
                                <Text style={styles.percentText}>{percent.toFixed(0)}%</Text>
                            </View>

                            {/* The Bar */}
                            <View style={styles.barTrack}>
                                <LinearGradient
                                    colors={[lang.color || theme.colors.primary, `${lang.color || theme.colors.primary}80`]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={[
                                        styles.barFill,
                                        {
                                            height: `${visualHeight}%`,
                                        }
                                    ]}
                                />
                            </View>

                            {/* Footer Info */}
                            <View style={styles.footerGroup}>
                                <View style={styles.iconContainer}>
                                    <Image
                                        source={{ uri: getLangIcon(lang.name) }}
                                        style={styles.icon}
                                        contentFit="contain"
                                    />
                                </View>
                                <Text style={styles.shortNameText}>{getShortName(lang.name)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 8,
        marginTop: 0,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    headerText: {
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#000',
        fontSize: 8,
        fontWeight: 'bold',
    },
    chartContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingBottom: 4,
        gap: 8,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        gap: 6,
    },
    valueBubble: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderWidth: 1,
        marginBottom: 2,
    },
    percentText: {
        color: theme.colors.text,
        fontSize: 10,
        fontWeight: 'bold',
    },
    barTrack: {
        width: 12,
        flex: 1,
        justifyContent: 'flex-end',
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 6,
    },
    footerGroup: {
        alignItems: 'center',
        gap: 4,
        height: 42,
        justifyContent: 'flex-start',
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    icon: {
        width: 16,
        height: 16,
    },
    shortNameText: {
        color: theme.colors.textDim,
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
