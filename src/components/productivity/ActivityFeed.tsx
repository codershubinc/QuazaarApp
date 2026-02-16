import React, { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

interface Event {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
    actor: {
        login: string;
    };
}

// Check every 60 seconds
const CHECK_INTERVAL = 60 * 1000;

export const ActivityFeed = () => {
    const { username, showToast } = useAppStore();
    const user = username || 'codershubinc';

    const getActionText = (type: string) => {
        switch (type) {
            case 'PushEvent': return 'Pushed to';
            case 'WatchEvent': return 'Starred';
            case 'PullRequestEvent': return 'Opened PR in';
            case 'CreateEvent': return 'Created';
            case 'IssueCommentEvent': return 'Commented in';
            default: return 'Activity in';
        }
    };

    const checkForUpdates = useCallback(async () => {
        if (!user) return;

        try {
            // Using a timestamp to bypass potential caching
            const url = `https://api.github.com/users/${user}/events?per_page=1&_t=${Date.now()}`;
            const res = await fetch(url);

            if (res.ok) {
                const data: Event[] = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const latestEvent = data[0];
                    const cachedId = await AsyncStorage.getItem('lastNotifiedEventId');

                    // If we have a cached ID and the new one is different, it's an update.
                    // If we don't have a cached ID, we just save this one (don't toast on first run/install)
                    if (cachedId) {
                        if (cachedId !== latestEvent.id) {
                            const action = getActionText(latestEvent.type);
                            const repoName = latestEvent.repo.name.split('/')[1] || latestEvent.repo.name;
                            const message = `New Activity: ${action} ${repoName}`;

                            showToast(message, 'info');
                            await AsyncStorage.setItem('lastNotifiedEventId', latestEvent.id);
                        }
                    } else {
                        // First run, just save the current latest ID so we can detect future updates
                        await AsyncStorage.setItem('lastNotifiedEventId', latestEvent.id);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to check for activity updates", error);
        }
    }, [user, showToast]);

    useEffect(() => {
        // Initial check
        checkForUpdates();

        // Interval check
        const interval = setInterval(() => {
            checkForUpdates();
        }, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [checkForUpdates]);

    return null; // Don't show anything in MainScreen
};
