import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const Toast = () => {
    const { toast, hideToast } = useAppStore();
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (toast) {
            // Slide up and fade in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();

            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Should verify if we need to animate out manually or if react unmounts it too fast.
            // Since we conditionally render this component in MainScreen usually, or return null here.
            // Better to return null if no toast, BUT we want animation out.
            // Strategy: Keep component mounted but verify toast state?
            // Actually, simplest is: MainScreen renders <Toast />, Toast returns null if !toast?
            // No, that kills exit animation.
            // Better: always render <Toast />, check toast inside.
        }
    }, [toast]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start(({ finished }) => {
            if (finished) hideToast();
        });
    };

    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (toast.type) {
            case 'success': return theme.colors.success;
            case 'error': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    return (
        <Animated.View style={[
            styles.container,
            {
                transform: [{ translateY }],
                opacity
            }
        ]}>
            <TouchableOpacity onPress={hide} activeOpacity={0.8}>
                <View style={[styles.content, { borderLeftColor: getColor() }]}>
                    <Ionicons name={getIcon()} size={24} color={getColor()} />
                    <Text style={styles.message}>{toast.message}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Above tab bar if exists, or just bottom area
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E2E', // Solid dark background or use theme.colors.surface
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: '80%',
        gap: 12
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    }
});
