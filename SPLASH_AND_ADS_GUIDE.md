# BlitzApp - Splash Screens, Connecting States & AdMob Integration

## Overview
This guide covers the implementation of splash screens, connecting/loading states, and Google AdMob integration in BlitzApp.

---

## 📱 Splash Screen with Typing Animation

### File: `SplashScreen.kt`

A beautiful typing animation that displays your app name character by character with a blinking cursor.

### Usage:
```kotlin
SplashTypingScreen(
    projectName = "BlitzApp",
    typingDelayMs = 80,           // Delay between each character
    pauseAfterTypingMs = 700,     // Pause after typing completes
    onFinished = {
        // Navigate to next screen
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
)
```

### Features:
- ✅ Character-by-character typing effect
- ✅ Blinking cursor animation
- ✅ Customizable typing speed
- ✅ Callback when animation completes
- ✅ Material 3 themed

---

## 🔄 Connecting/Loading Screens

### File: `ConnectingComposables.kt`

Four different loading screen styles to show connection/loading states.

### 1. ConnectingFullScreen
Full-screen centered circular progress with animated dots.

**Best for:** Initial server connection
```kotlin
ConnectingFullScreen(message = "Connecting to server")
```

### 2. ConnectingCard
Card-based progress indicator with shadow elevation.

**Best for:** WebSocket connection status
```kotlin
ConnectingCard(message = "Establishing WebSocket")
```

### 3. ConnectingBouncingDots
Three animated bouncing dots with status message.

**Best for:** Data synchronization
```kotlin
ConnectingBouncingDots(message = "Syncing data")
```

### 4. ConnectingLinearProgress
Linear progress bar with status text.

**Best for:** Determinate loading operations
```kotlin
ConnectingLinearProgress(message = "Loading resources")
```

### 5. ConnectingInline
Small inline loader for use within other screens.

**Best for:** Loading states within existing UI
```kotlin
ConnectingInline(message = "Loading")
```

---

## 📺 Google AdMob Integration

### Setup Complete ✅
- **App ID:** `ca-app-pub-1775178587078079~2627652046`
- **Ad Unit ID:** `ca-app-pub-1775178587078079/4230601657`

### Files:
1. **BlitzApplication.kt** - Initializes AdMob SDK
2. **AdComposables.kt** - Ad view composables
3. **AndroidManifest.xml** - Configuration

### Available Ad Composables:

#### 1. BannerAdView (50dp height)
```kotlin
BannerAdView(modifier = Modifier.fillMaxWidth())
```

#### 2. LargeBannerAdView (100dp height)
```kotlin
LargeBannerAdView(modifier = Modifier.fillMaxWidth())
```

#### 3. AdaptiveBannerAdView (Responsive)
```kotlin
AdaptiveBannerAdView(modifier = Modifier.fillMaxWidth())
```

### Integration Example:
```kotlin
Column(modifier = Modifier.fillMaxSize()) {
    // Your content
    YourMainContent()
    
    // Banner ad at bottom
    BannerAdView(
        modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.BottomCenter)
    )
}
```

---

## 🚀 Implementation Checklist

### ✅ Completed:
- [x] SplashScreen with typing animation
- [x] 4 different connecting/loading screens
- [x] AdMob SDK initialization (BlitzApplication.kt)
- [x] AdMob App ID in AndroidManifest.xml
- [x] Banner ad composables
- [x] Material 3 theming integration

### 📝 Configuration:

#### AndroidManifest.xml
```xml
<application
    android:name=".BlitzApplication"
    ...>
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-1775178587078079~2627652046" />
</application>
```

#### build.gradle.kts
```kotlin
dependencies {
    implementation("com.google.android.gms:play-services-ads:22.6.0")
}
```

---

## 🎨 Example Flow

### Recommended App Launch Sequence:

1. **Splash Typing Screen** (2-3 seconds)
   ```kotlin
   SplashTypingScreen(projectName = "BlitzApp")
   ```

2. **Connecting to Server** (until connected)
   ```kotlin
   ConnectingFullScreen(message = "Connecting to server")
   ```

3. **Establishing WebSocket** (until WS ready)
   ```kotlin
   ConnectingCard(message = "Establishing WebSocket")
   ```

4. **Load Main Activity**
   ```kotlin
   startActivity(Intent(this, MainActivity::class.java))
   ```

---

## 🧪 Testing

### ✅ Test Ads Already Enabled!

Test device is configured in `BlitzApplication.kt`:
```kotlin
Device ID: 2a10jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2
```

**This means:**
- Test ads will automatically show on your device
- Safe to click without affecting your AdMob account
- Look for "Test Ad" label on displayed ads

### Check Initialization:
View logcat output:
```bash
adb logcat | grep BlitzApp
```

Expected output:
```
D/BlitzApp: Adapter: ..., Status: Ready, Latency: ...
D/BlitzApp: Test device configured for AdMob testing
```

### For Production Release:
**Important:** Comment out the test configuration in `BlitzApplication.kt` before publishing:
```kotlin
// val requestConfiguration = RequestConfiguration.Builder()
//     .setTestDeviceIds(listOf("2a10jWT5DfCYez7vSyrR2NiBg..."))
//     .build()
// MobileAds.setRequestConfiguration(requestConfiguration)
```

---

## 📱 Example Activity

See `SplashExampleActivity.kt` for a complete demonstration of:
- Sequential splash screens
- All connecting states
- Navigation flow
- Real-world usage patterns

---

## 🎯 Best Practices

### Splash Screens:
- Keep typing animation under 3 seconds
- Use appropriate delays for readability
- Always provide `onFinished` callback

### Connecting Screens:
- Match screen style to connection type
- Use descriptive messages
- Handle connection failures gracefully

### Ads:
- Place banner ads at natural break points
- Don't obstruct critical UI elements
- Test with real ads before publishing
- Follow AdMob policies

---

## 📞 Support

For issues or questions:
1. Check logcat for initialization status
2. Verify AdMob account and IDs
3. Ensure proper permissions in manifest
4. Test on physical device (ads may not show in emulator)

---

## 🔧 Troubleshooting

### Ads not showing:
- Wait 10-60 seconds after initialization
- Check internet connection
- Verify App ID and Unit ID are correct
- Check AdMob account status

### Splash screens:
- Ensure proper theme application
- Check for crashes in onFinished callback
- Verify navigation logic

---

**Version:** 1.0  
**Last Updated:** 2025-01-14  
**Framework:** Jetpack Compose + Material 3

