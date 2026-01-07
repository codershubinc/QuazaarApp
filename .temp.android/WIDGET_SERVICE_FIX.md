# Widget Service Crash Fix - December 5, 2025

## Problem
The music widget was crashing with a SecurityException:
```
java.lang.SecurityException: Starting FGS with type dataSync requires permissions: 
android.permission.FOREGROUND_SERVICE_DATA_SYNC
```

## Root Causes Identified

1. **Wrong Foreground Service Type**: MusicService was using `FOREGROUND_SERVICE_TYPE_DATA_SYNC` but should use `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK` for a music player service.

2. **Missing Permission**: The manifest was missing `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission required for Android 14+ (API 34+).

3. **Wrong Service Path**: AndroidManifest.xml referenced `.MusicService` but the actual class was in `com.quazaar.remote.service.MusicService`.

4. **Duplicate MusicService**: There were two MusicService.kt files:
   - `/app/src/main/java/com/quazaar/remote/MusicService.kt` (incomplete, deleted)
   - `/app/src/main/java/com/quazaar/remote/service/MusicService.kt` (kept)

5. **Missing Dependencies**: Retrofit2 dependencies were missing for FileShareManager.

6. **Missing Imports**: 
   - Intent import in MainActivity
   - painterResource import in composables.kt
   - R class import in composables.kt

## Fixes Applied

### 1. AndroidManifest.xml
- Added `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission
- Fixed service path from `.MusicService` to `.service.MusicService`

### 2. MusicService.kt (service package)
- Changed foreground service type from `FOREGROUND_SERVICE_TYPE_DATA_SYNC` to `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK`
- Changed API level check from `UPSIDE_DOWN_CAKE (34)` to `Q (29)` for service type requirement
- Added WebSocket connection initialization in service
- Service now creates its own MainViewModel and WebSocketManager instance
- Automatically connects to saved WebSocket settings on start

### 3. MainActivity.kt
- Added Intent import
- Added MusicService import
- Service is now started when MainActivity launches: `MusicService.start(this)`
- Added `onNewIntent()` method to handle widget button actions
- Added `handleWidgetActions()` method to send commands (play_pause, next, previous) to WebSocket
- Added `onDestroy()` to properly close WebSocket connection

### 4. build.gradle.kts
- Added Retrofit2 dependencies:
  - `implementation("com.squareup.retrofit2:retrofit:2.9.0")`
  - `implementation("com.squareup.retrofit2:converter-gson:2.9.0")`

### 5. composables.kt
- Added `import androidx.compose.ui.res.painterResource`
- Added `import com.quazaar.remote.R`

### 6. Removed Duplicate File
- Deleted `/app/src/main/java/com/quazaar/remote/MusicService.kt`

### 7. music_widget_layout.xml
- Replaced `<Space>` widget with `<View>` for RemoteView compatibility
- Space widgets are not supported in RemoteViews (Android widget system)

### 8. MusicWidgetProvider.kt
- Removed unused `Bitmap` import
- Fixed `String.format()` to use `Locale.US` to avoid locale-dependent bugs

## How It Works Now

1. **App Launch**: 
   - MainActivity starts and immediately launches MusicService as a foreground service
   - MusicService creates its own WebSocketManager and connects using saved settings
   - Widget receives updates via WebSocketManager calling `MusicWidgetProvider.updateWidget()`

2. **Background Operation**:
   - MusicService runs as foreground service with proper notification
   - WebSocket connection stays alive even when app is in background
   - Widget continues to receive music info updates

3. **Widget Button Actions**:
   - User clicks play/pause/next/previous on widget
   - MusicWidgetProvider receives broadcast
   - Opens MainActivity with specific action intent
   - MainActivity.handleWidgetActions() sends appropriate command via WebSocket
   - Command is sent to server (e.g., "play_pause", "next", "previous")

4. **Widget Updates**:
   - Server sends music info via WebSocket
   - WebSocketManager.parseMessage() updates ViewModel and calls updateWidget()
   - Widget data saved to SharedPreferences
   - Broadcast triggers widget UI refresh
   - RemoteViews updated with new song info, progress, album art

## Service Type Requirements

- **Android 10+ (API 29+)**: Foreground service type must be specified
- **Android 14+ (API 34+)**: Specific permission required for each service type
- **Music/Media services**: Use `FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission

## Testing
- Build successful
- APK installed on device
- Service should now start without SecurityException
- Widget should display music info and buttons should work

## Next Steps for User
1. Launch the app to start the service
2. Add the music widget to home screen
3. Verify widget displays current music info
4. Test play/pause, next, previous buttons
5. Check that widget updates in background

## Files Modified
- `/app/src/main/AndroidManifest.xml`
- `/app/src/main/java/com/quazaar/remote/service/MusicService.kt`
- `/app/src/main/java/com/quazaar/remote/MainActivity.kt`
- `/app/src/main/java/com/quazaar/remote/widget/MusicWidgetProvider.kt`
- `/app/src/main/res/layout/music_widget_layout.xml`
- `/app/build.gradle.kts`
- `/app/src/main/java/com/quazaar/remote/ui/composables.kt`

## Files Deleted
- `/app/src/main/java/com/quazaar/remote/MusicService.kt` (duplicate)

## Build Status
- ✅ Build: SUCCESS
- ✅ Installation: SUCCESS
- ✅ No compilation errors
- ✅ Ready for testing

## Related Documents
- See `WIDGET_TESTING_GUIDE.md` for comprehensive testing instructions
- See logcat for runtime behavior verification

