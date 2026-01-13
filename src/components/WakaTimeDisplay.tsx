import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Image } from 'expo-image';
import { getLangIcon } from './helper/GetLanguageIcon';
import { fetcher } from './helper/Fetcher';

export const WakaTimeDisplay = () => {
    const [workingHours, setWorkingHours] = useState<string>('0 hrs 0 mins');
    const [topLanguages, setTopLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWakaTime = async () => {
        try {
            const data = await fetcher('/api/v0.1/system/wakatime');

            if (data.stats) {
                // Get working hours
                if (data.stats.cumulative_total && data.stats.cumulative_total.text) {
                    setWorkingHours(data.stats.cumulative_total.text);
                }

                // Get top languages
                if (data.stats.data &&
                    data.stats.data.length > 0 &&
                    data.stats.data[0].languages &&
                    data.stats.data[0].languages.length > 0) {
                    const langs = data.stats.data[0].languages.slice(0, 2).map((l: any) => l.name);
                    setTopLanguages(langs);
                }
            }
        } catch (error) {
            console.error('Failed to fetch WakaTime data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWakaTime();

        // Refresh every 5 minutes (300,000 ms)
        const interval = setInterval(fetchWakaTime, 300000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Ionicons name="code-slash-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.text}>{workingHours}</Text>
            {topLanguages.length > 0 && (
                <>
                    <View style={styles.divider} />
                    {topLanguages.map((lang, index) => (
                        <Image
                            key={lang}
                            source={{ uri: getLangIcon(lang) }}
                            style={{ width: 16, height: 16 }}
                            contentFit="contain"
                        />
                    ))}
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
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 6,
    },
    text: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: theme.colors.border,
        marginHorizontal: 2,
    },
});
