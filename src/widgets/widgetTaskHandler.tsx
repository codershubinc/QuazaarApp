/**
 * Widget task handler — called by the Android widget framework.
 * Handles widget lifecycle events and user interaction click actions.
 */
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from '../services/WebSocketService';
import { NowPlayingWidget } from './NowPlayingWidget';

const nameToWidget = {
    NowPlaying: NowPlayingWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE': {
            const savedTitle = (await AsyncStorage.getItem('widget_nowplaying_title')) ?? undefined;
            const savedArtist = (await AsyncStorage.getItem('widget_nowplaying_artist')) ?? undefined;
            const savedPlaying = await AsyncStorage.getItem('widget_nowplaying_isplaying');
            const savedArtwork = await AsyncStorage.getItem('widget_nowplaying_artwork');
            const savedPlayer = (await AsyncStorage.getItem('widget_nowplaying_player')) ?? undefined;

            props.renderWidget(
                <Widget
                    title={savedTitle}
                    artist={savedArtist}
                    isPlaying={savedPlaying === 'true'}
                    artworkUri={savedArtwork}
                    playerName={savedPlayer}
                />
            );
            break;
        }

        case 'WIDGET_RESIZED':
            props.renderWidget(<Widget />);
            break;

        case 'WIDGET_DELETED':
            break;

        case 'WIDGET_CLICK': {
            // clickAction is the string set on each TextWidget
            const action = (props as any).clickAction as string | undefined;

            if (action === 'TOGGLE_PLAYBACK') {
                webSocketService.sendCommand('media_playpause', {});
            } else if (action === 'PREVIOUS') {
                webSocketService.sendCommand('media_previous', {});
            } else if (action === 'NEXT') {
                webSocketService.sendCommand('media_next', {});
            }

            // Re-render with current state
            const savedTitle = (await AsyncStorage.getItem('widget_nowplaying_title')) ?? undefined;
            const savedArtist = (await AsyncStorage.getItem('widget_nowplaying_artist')) ?? undefined;
            const savedPlaying = await AsyncStorage.getItem('widget_nowplaying_isplaying');
            const savedArtwork = await AsyncStorage.getItem('widget_nowplaying_artwork');
            const savedPlayer = (await AsyncStorage.getItem('widget_nowplaying_player')) ?? undefined;

            props.renderWidget(
                <Widget
                    title={savedTitle}
                    artist={savedArtist}
                    isPlaying={savedPlaying === 'true'}
                    artworkUri={savedArtwork}
                    playerName={savedPlayer}
                />
            );
            break;
        }

        default:
            break;
    }
}
