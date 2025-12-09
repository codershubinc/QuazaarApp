import { create } from 'zustand';
import { MediaInfo, BluetoothDevice, WiFiInfo, ArtWork, ThemeColors } from '../types';
import { theme } from '../constants/theme';

interface AppState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    mediaInfo: MediaInfo | null;
    artWork: ArtWork | null;
    bluetoothDevices: BluetoothDevice[];
    wifiInfo: WiFiInfo | null;
    commandOutput: string | null;
    volumeLevel: number;
    isMuted: boolean;
    brightnessLevel: number;
    themeColors: ThemeColors;

    setConnected: (isConnected: boolean) => void;
    setConnecting: (isConnecting: boolean) => void;
    setError: (error: string | null) => void;
    setMediaInfo: (mediaInfo: MediaInfo | null) => void;
    setArtWork: (artWork: ArtWork | null) => void;
    setBluetoothDevices: (devices: BluetoothDevice[]) => void;
    setWifiInfo: (wifiInfo: WiFiInfo | null) => void;
    setCommandOutput: (output: string | null) => void;
    setVolumeLevel: (level: number) => void;
    setIsMuted: (isMuted: boolean) => void;
    setBrightnessLevel: (level: number) => void;
    setThemeColors: (colors: Partial<ThemeColors>) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isConnected: false,
    isConnecting: false,
    error: null,
    mediaInfo: null,
    artWork: null,
    bluetoothDevices: [],
    wifiInfo: null,
    commandOutput: null,
    volumeLevel: 0,
    isMuted: false,
    brightnessLevel: 0,
    themeColors: theme.colors,

    setConnected: (isConnected) => set({ isConnected }),
    setConnecting: (isConnecting) => set({ isConnecting }),
    setError: (error) => set({ error }),
    setMediaInfo: (mediaInfo) => set({ mediaInfo }),
    setArtWork: (artWork) => set({ artWork }),
    setBluetoothDevices: (bluetoothDevices) => set({ bluetoothDevices }),
    setWifiInfo: (wifiInfo) => set({ wifiInfo }),
    setCommandOutput: (commandOutput) => set({ commandOutput }),
    setVolumeLevel: (volumeLevel) => set({ volumeLevel }),
    setIsMuted: (isMuted) => set({ isMuted }),
    setBrightnessLevel: (brightnessLevel) => set({ brightnessLevel }),
    setThemeColors: (colors) => set((state) => ({ themeColors: { ...state.themeColors, ...colors } })),
}));
