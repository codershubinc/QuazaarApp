import AsyncStorage from '@react-native-async-storage/async-storage';


export const fetcher = async (url: string, options?: RequestInit) => {
    const ip = await AsyncStorage.getItem('ip') || '192.168.1.110';
    const port = await AsyncStorage.getItem('port') || '8765';
    const deviceId = await AsyncStorage.getItem('deviceId') || '$2a$10$FdbfnL3QJJ39vcJPM4WhyOSg8a6EHKIRE/6LaIDSbIrQ7BZZH8TB6';

    const headers: HeadersInit = {
        'Authorization': `Bearer ${deviceId}`,
        'Content-Type': 'application/json',
        ...options?.headers as Record<string, string>,
    };

    const fullUrl = `http://${ip}:${port}${url}`;
    const res = await fetch(fullUrl, {
        ...options,
        headers: headers,
    });
    return res.json();
}