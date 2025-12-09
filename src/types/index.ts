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
