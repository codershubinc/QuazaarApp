import { useAppStore } from '../store/useAppStore';
import { ServerResponse, MediaInfo, BluetoothDevice, WiFiInfo, SystemStatus, SystemCommand, SystemActionResponse } from '../types';

class WebSocketService {
    private ws: WebSocket | null = null;
    private lastUrl: string | null = null;
    private retryCount = 0;
    private maxRetries = 5;
    private retryDelayMs = 5000;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    connect(url: string) {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.onclose = null; // Prevent reconnect trigger
            this.ws.close();
        }

        this.lastUrl = url;
        useAppStore.getState().setConnecting(true);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('WebSocket Connected');
                useAppStore.getState().setConnected(true);
                useAppStore.getState().setConnecting(false);
                useAppStore.getState().setError(null);
                this.retryCount = 0;
            };

            this.ws.onmessage = (event) => {
                this.parseMessage(event.data);
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket Closed', event.code, event.reason);
                useAppStore.getState().setConnected(false);
                useAppStore.getState().setConnecting(false);
                this.handleReconnect();
            };

            this.ws.onerror = (error: any) => {
                console.error('WebSocket Error', error);
                useAppStore.getState().setConnected(false);
                useAppStore.getState().setConnecting(false);
                useAppStore.getState().setError(`Connection failed: ${error.message || 'Unknown error'}`);
            };
        } catch (e: any) {
            console.error('WebSocket Connection Error', e);
            useAppStore.getState().setError(`Connection error: ${e.message}`);
            this.handleReconnect();
        }
    }

    private handleReconnect() {
        if (this.lastUrl && this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying connection ${this.retryCount}/${this.maxRetries} in ${this.retryDelayMs}ms`);
            this.reconnectTimeout = setTimeout(() => {
                if (this.lastUrl) {
                    this.connect(this.lastUrl);
                }
            }, this.retryDelayMs);
        } else {
            console.log('Max retries reached or no URL set');
        }
    }

    sendCommand(command: string, payload?: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = payload ? { command, ...payload } : { command };
            this.ws.send(JSON.stringify(message));
        }
    }

    sendSystemCommand(cmd: SystemCommand) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(cmd));
        }
    }

    volumeIncrease() {
        this.sendSystemCommand({ type: 'system', msg_of: 'volume', action: 'inc' });
    }

    volumeDecrease() {
        this.sendSystemCommand({ type: 'system', msg_of: 'volume', action: 'dec' });
    }

    toggleMute() {
        this.sendSystemCommand({ type: 'system', msg_of: 'volume', action: 'mute' });
    }

    brightnessIncrease() {
        this.sendSystemCommand({ type: 'system', msg_of: 'brightness', action: 'inc' });
    }

    brightnessDecrease() {
        this.sendSystemCommand({ type: 'system', msg_of: 'brightness', action: 'dec' });
    }

    private parseMessage(json: string) {
        try {
            const response: ServerResponse<any> = JSON.parse(json);
            const store = useAppStore.getState();

            switch (response.message) {
                case 'media_info':
                    if (response.data) {
                        const mediaInfo = response.data as MediaInfo;
                        store.setMediaInfo(mediaInfo);
                        if (mediaInfo.Artwork) {
                            store.setArtWork({ url: mediaInfo.Artwork });
                        }
                    }
                    break;
                case 'bluetooth':
                    if (response.data) {
                        const devices = response.data as BluetoothDevice[];
                        store.setBluetoothDevices(devices.filter(d => d.connected));
                    }
                    break;
                case 'wifi':
                    if (response.data) {
                        store.setWifiInfo(response.data as WiFiInfo);
                    }
                    break;
                case 'command_output':
                    if (response.data) {
                        store.setCommandOutput(String(response.data));
                    }
                    break;
                case 'volume_status':
                case 'system_volume':
                    if (response.data) {
                        const status = response.data as SystemStatus;
                        if (status.value !== undefined) store.setVolumeLevel(status.value);
                        if (status.muted !== undefined) store.setIsMuted(status.muted);
                    }
                    break;
                case 'brightness_status':
                case 'system_brightness':
                    if (response.data) {
                        const status = response.data as SystemStatus;
                        if (status.value !== undefined) store.setBrightnessLevel(status.value);
                    }
                    break;
                case "system":
                    console.log("system type of responce", response.data);
                    if (response.data) {
                        const systemData = response.data as SystemActionResponse;
                        if (systemData.current_volume !== undefined) {
                            store.setVolumeLevel(systemData.current_volume);
                        }
                        if (systemData.current_brightness !== undefined) {
                            store.setBrightnessLevel(systemData.current_brightness);
                        }
                    }
                    break;
            }
        } catch (e) {
            console.error('Error parsing message', e);
        }
    }

    close() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
        }
        this.lastUrl = null;
        this.retryCount = 0;
    }
}

export const webSocketService = new WebSocketService();
