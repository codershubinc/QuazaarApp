const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Adds <queries> entry for Spotify to AndroidManifest.xml
 * Required for Android 11+ package visibility (Linking.canOpenURL)
 */
module.exports = function withSpotifyQueries(config) {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;

        if (!manifest.queries) {
            manifest.queries = [];
        }

        const alreadyAdded = manifest.queries.some(
            (q) => q.package && q.package.some((p) => p.$?.['android:name'] === 'com.spotify.music')
        );

        if (!alreadyAdded) {
            manifest.queries.push({
                package: [{ $: { 'android:name': 'com.spotify.music' } }],
            });
        }

        return config;
    });
};
