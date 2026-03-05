import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

interface NowPlayingWidgetProps {
    title?: string;
    artist?: string;
    isPlaying?: boolean;
    artworkUri?: string | null;
    playerName?: string;
}

export function NowPlayingWidget({
    title,
    artist,
    isPlaying,
    artworkUri,
    playerName,
}: NowPlayingWidgetProps) {
    const hasMedia = !!(title || artist);

    return (
        <FlexWidget
            style={{
                flexDirection: 'column',
                width: 'match_parent',
                height: 'match_parent',
                backgroundColor: '#0e0e23',
                borderRadius: 20,
                padding: 14,
            }}
        >
            {/* Header row */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                }}
            >
                <TextWidget
                    style={{ fontSize: 11, color: '#7c83fd', fontWeight: 'bold' }}
                    text="🎵  NOW PLAYING"
                    maxLines={1}
                />
                {playerName ? (
                    <TextWidget
                        style={{ fontSize: 10, color: '#555580', marginLeft: 6 }}
                        text={`· ${playerName}`}
                        maxLines={1}
                    />
                ) : null}
            </FlexWidget>

            {/* Content row */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                }}
            >
                {/* Artwork */}
                {artworkUri ? (
                    <ImageWidget
                        image={artworkUri as `https:${string}`}
                        imageWidth={64}
                        imageHeight={64}
                        radius={10}
                    />
                ) : (
                    <FlexWidget
                        style={{
                            width: 64,
                            height: 64,
                            backgroundColor: '#1e1e40',
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TextWidget style={{ fontSize: 28 }} text="🎵" />
                    </FlexWidget>
                )}

                {/* Track info + controls */}
                <FlexWidget
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        marginLeft: 12,
                    }}
                >
                    <TextWidget
                        style={{
                            fontSize: 15,
                            fontWeight: 'bold',
                            color: '#ffffff',
                        }}
                        text={hasMedia ? (title || '—') : 'Nothing playing'}
                        maxLines={1}
                    />
                    <TextWidget
                        style={{ fontSize: 12, color: '#9999bb', marginTop: 4 }}
                        text={hasMedia ? (artist || '—') : 'Open Quazaar to connect'}
                        maxLines={1}
                    />

                    {/* Controls */}
                    <FlexWidget
                        style={{
                            flexDirection: 'row',
                            marginTop: 8,
                            alignItems: 'center',
                        }}
                    >
                        <TextWidget
                            style={{ fontSize: 20, color: '#7c83fd' }}
                            text="⏮"
                            clickAction="PREVIOUS"
                        />
                        <TextWidget
                            style={{ fontSize: 22, color: '#ffffff', marginLeft: 18 }}
                            text={isPlaying ? '⏸' : '▶'}
                            clickAction="TOGGLE_PLAYBACK"
                        />
                        <TextWidget
                            style={{ fontSize: 20, color: '#7c83fd', marginLeft: 18 }}
                            text="⏭"
                            clickAction="NEXT"
                        />
                    </FlexWidget>
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}
