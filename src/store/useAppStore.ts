import { create } from 'zustand';
import { MediaInfo, BluetoothDevice, WiFiInfo, ArtWork, ThemeColors, BatteryData, Todo } from '../types';
import { theme } from '../constants/theme';

interface AppState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    mediaInfo: MediaInfo | null;
    artWork: ArtWork | null;
    bluetoothDevices: BluetoothDevice[];
    wifiInfo: WiFiInfo | null;
    batteryData: BatteryData | null;
    deviceBattery: { level: number; state: number } | null;
    commandOutput: string | null;
    volumeLevel: number;
    isMuted: boolean;
    brightnessLevel: number;
    themeColors: ThemeColors;
    authToken: string | null;
    username: string | null;
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    todos: Todo[];
    isFactPopupOpen: boolean;

    setConnected: (isConnected: boolean) => void;
    setConnecting: (isConnecting: boolean) => void;
    setError: (error: string | null) => void;
    setMediaInfo: (mediaInfo: MediaInfo | null) => void;
    setArtWork: (artWork: ArtWork | null) => void;
    setBluetoothDevices: (devices: BluetoothDevice[]) => void;
    setWifiInfo: (wifiInfo: WiFiInfo | null) => void;
    setDeviceBattery: (battery: { level: number; state: number } | null) => void;
    setBatteryData: (batteryData: BatteryData | null) => void;
    setCommandOutput: (output: string | null) => void;
    setVolumeLevel: (level: number) => void;
    setIsMuted: (isMuted: boolean) => void;
    setBrightnessLevel: (level: number) => void;
    setThemeColors: (colors: Partial<ThemeColors>) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
    setAuthToken: (token: string | null) => void;
    setUsername: (username: string | null) => void;
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    setTodos: (todos: Todo[]) => void;
    openFactPopup: () => void;
    closeFactPopup: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    isConnected: false,
    isConnecting: false,
    error: null,
    mediaInfo: null,
    artWork: null,
    bluetoothDevices: [],
    wifiInfo: null,
    deviceBattery: null,
    batteryData: null,
    commandOutput: null,
    volumeLevel: 0,
    isMuted: false,
    brightnessLevel: 0,
    toast: null,
    themeColors: theme.colors,
    authToken: null,
    username: null,
    todos: [],
    isFactPopupOpen: false,

    setConnected: (isConnected) => set({ isConnected }),
    setConnecting: (isConnecting) => set({ isConnecting }),
    setError: (error) => set({ error }),
    setMediaInfo: (mediaInfo) => set({ mediaInfo }),
    setArtWork: (artWork) => set({ artWork }),
    setBluetoothDevices: (bluetoothDevices) => set({ bluetoothDevices }),
    setWifiInfo: (wifiInfo) => set({ wifiInfo }),
    setDeviceBattery: (deviceBattery) => set({ deviceBattery }),
    setBatteryData: (batteryData) => set({ batteryData }),
    setCommandOutput: (commandOutput) => set({ commandOutput }),
    setVolumeLevel: (volumeLevel) => set({ volumeLevel }),
    setIsMuted: (isMuted) => set({ isMuted }),
    setAuthToken: (authToken) => set({ authToken }),
    setUsername: (username) => set({ username }),
    setBrightnessLevel: (brightnessLevel) => set({ brightnessLevel }),
    showToast: (message, type = 'info') => set({ toast: { message, type } }),
    hideToast: () => set({ toast: null }),
    setThemeColors: (colors) => set((state) => ({ themeColors: { ...state.themeColors, ...colors } })),

    addTodo: (text) => set((state) => ({
        todos: [
            {
                id: Date.now().toString(),
                text,
                completed: false,
                createdAt: Date.now(),
            },
            ...state.todos,
        ],
    })),
    toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
    })),
    deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
    })),
    setTodos: (todos) => set({ todos }),
    openFactPopup: () => set({ isFactPopupOpen: true }),
    closeFactPopup: () => set({ isFactPopupOpen: false }),
}));
