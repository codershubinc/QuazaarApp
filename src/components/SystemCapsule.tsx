import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

interface SystemUsage {
    cpu_usage: number;
    memory_usage: number;
    gpu_usage: number;
    gpu_memory: number;
}

export const SystemCapsule = () => {
    const [usage, setUsage] = useState<SystemUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const { authToken } = useAppStore();

    const fetchData = async () => {
        try {
            if (!authToken) return;
            const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
            const port = await AsyncStorage.getItem('port') || '8765';
            const url = `http://${ip}:${port}/api/v0.1/system/usage?deviceId=${encodeURIComponent(authToken)}`;
            const response = await fetch(url);


            const data = await response.json();
            // console.log("got  data ::", data);
            if (data.success && data.usage) {
                setUsage(data.usage);
            }
        } catch (error) {
            console.error('Failed to fetch system usage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading || !usage) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>LOADING...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.statItem}>
                <Ionicons name="hardware-chip-outline" size={10} color={theme.colors.secondary} />
                <Text style={styles.text}>{Math.round(usage.cpu_usage)}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Ionicons name="file-tray-stacked-outline" size={12} color={theme.colors.accent} />
                <Text style={styles.text}>{Math.round(usage.memory_usage)}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Ionicons name="aperture-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.text}>{Math.round(usage.gpu_usage)}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Ionicons name="cube-outline" size={12} color={theme.colors.warning} />
                <Text style={styles.text}>{Math.round(usage.gpu_memory)}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 6,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        color: theme.colors.text,
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
