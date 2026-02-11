import AsyncStorage from '@react-native-async-storage/async-storage';


export const fetcher = async (url: string, options?: RequestInit) => {
    try {
        const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
        const port = await AsyncStorage.getItem('port') || '8765';
        const authToken = await AsyncStorage.getItem('authToken');

        if (!authToken) {
            throw new Error('No authentication token available');
        }

        const headers: HeadersInit = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options?.headers as Record<string, string>,
        };

        const fullUrl = `http://${ip}:${port}${url}`;
        const res = await fetch(fullUrl, {
            ...options,
            headers: headers,
        });
        return res.json();
    } catch (error) {
        console.log("Got err for", url, error);

    }
}