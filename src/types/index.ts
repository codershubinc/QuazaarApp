export interface ServerResponse<T> {
    status: string;
    message: string;
    data?: T;
}

export interface ArtWork {
    url?: string;
}

export interface MediaInfo {
    Title?: string;
    Artist?: string;
    Album?: string;
    Artwork?: string;
    Length?: number;
    Position?: number;
    Status?: string;
    Player?: string;
}

export interface BluetoothDevice {
    name?: string;
    macAddress?: string;
    connected: boolean;
    battery?: number;
    icon?: string;
}

export interface WiFiInfo {
    ssid?: string;
    signalStrength?: number;
    linkSpeed?: number;
    frequency?: string;
    security?: string;
    ipAddress?: string;
    connected?: boolean;
    downloadSpeed?: number;
    uploadSpeed?: number;
    interface?: string;
    unitOfSpeed?: string;
}

export interface SystemCommand {
    type: string;
    msg_of: string; // "volume" or "brightness"
    action: string; // "inc", "dec", "set", "mute", "get"
    set_to_vol?: number;
    set_to?: number;
}

export interface SystemStatus {
    type?: string;
    msg_of?: string; // "volume" or "brightness"
    value?: number;
    muted?: boolean;
}

export interface SystemActionResponse {
    action: string;
    current_volume?: number;
    previous_volume?: number;
    current_brightness?: number;
    previous_brightness?: number;
    success: boolean;
    timestamp: number;
}

export interface ThemeColors {
    background: string;
    surface: string;
    surfaceHighlight: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    textDim: string;
    success: string;
    error: string;
    warning: string;
    border: string;
}

export interface BatteryData {
    percentage: number;
    state: string; // 'charging', 'discharging', 'full', 'unknown'
    timeRemaining?: number;
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
}
