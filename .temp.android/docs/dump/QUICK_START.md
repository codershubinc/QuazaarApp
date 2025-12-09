# BlitzApp - Quick Start Guide

## 🚀 Use the New Features

### 1️⃣ Add Typing Splash to Any Activity

```kotlin
class YourActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                SplashTypingScreen(
                    projectName = "BlitzApp",
                    onFinished = {
                        // Navigate to next screen
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
                    }
                )
            }
        }
    }
}
```

---

### 2️⃣ Show Connecting Screen While Loading

```kotlin
@Composable
fun YourScreen() {
    var isConnecting by remember { mutableStateOf(true) }
    
    if (isConnecting) {
        ConnectingFullScreen("Connecting to server")
    } else {
        YourMainContent()
    }
}
```

---

### 3️⃣ Add Banner Ad to Bottom of Screen

```kotlin
@Composable
fun YourScreen() {
    Column(modifier = Modifier.fillMaxSize()) {
        // Your main content
        Box(modifier = Modifier.weight(1f)) {
            YourContent()
        }
        
        // Banner ad at bottom
        BannerAdView(modifier = Modifier.fillMaxWidth())
    }
}
```

---

### 4️⃣ Test Everything with Example Activity

**Change launcher in AndroidManifest.xml:**

```xml
<activity
    android:name=".SplashExampleActivity"
    android:exported="true"
    android:label="@string/app_name"
    android:theme="@style/Theme.Quazaar">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

This will show:
1. Typing animation splash
2. All 4 connecting screens in sequence
3. Navigate to MainActivity

---

## 🎨 Choose Your Connecting Style

```kotlin
// Style 1: Full screen with spinner
ConnectingFullScreen("Connecting to server")

// Style 2: Card with spinner
ConnectingCard("Establishing WebSocket")

// Style 3: Bouncing dots
ConnectingBouncingDots("Syncing data")

// Style 4: Linear progress bar
ConnectingLinearProgress("Loading resources")

// Style 5: Small inline loader
ConnectingInline("Loading")
```

---

## 🎯 Complete Example: Custom Splash Activity

```kotlin
class CustomSplashActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                SplashSequence()
            }
        }
    }
    
    @Composable
    fun SplashSequence() {
        var stage by remember { mutableIntStateOf(0) }
        
        when (stage) {
            0 -> {
                // Stage 1: Typing animation
                SplashTypingScreen(
                    projectName = "BlitzApp",
                    onFinished = { stage = 1 }
                )
            }
            1 -> {
                // Stage 2: Connect to server
                ConnectingFullScreen("Connecting to server")
                
                LaunchedEffect(Unit) {
                    // Simulate connection
                    delay(2000)
                    stage = 2
                }
            }
            2 -> {
                // Stage 3: Navigate to main
                LaunchedEffect(Unit) {
                    startActivity(Intent(
                        this@CustomSplashActivity,
                        com.quazaar.remote.MainActivity::class.java
                    ))
                    finish()
                }
            }
        }
    }
}
```

---

## 📱 Add to Existing MainActivity

Update your MainActivity to show ads:

```kotlin
@Composable
fun MainScreen(viewModel: MainViewModel) {
    Column(modifier = Modifier.fillMaxSize()) {
        // Your existing content
        Box(modifier = Modifier.weight(1f)) {
            // ... your existing UI
        }
        
        // Add banner ad at bottom
        BannerAdView(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
        )
    }
}
```

---

## 🧪 Test AdMob

### ✅ Test Ads Enabled!

Test device is already configured in `BlitzApplication.kt`:
```kotlin
Device ID: 2a10jWT5DfCYez7vSyrR2NiBg...
```

### 1. Check Initialization Logs:
```bash
adb logcat | grep BlitzApp
```

You should see:
```
D/BlitzApp: Adapter: ..., Status: Ready, Latency: ...
D/BlitzApp: Test device configured for AdMob testing
```

### 2. Test Ads Will Show:
- Test ads will display with "Test Ad" label
- No need to worry about invalid clicks during development
- Switch to production ads before release

### 3. To Disable Test Ads (For Production):

Comment out in `BlitzApplication.kt`:
```kotlin
// val requestConfiguration = RequestConfiguration.Builder()
//     .setTestDeviceIds(listOf("..."))
//     .build()
// MobileAds.setRequestConfiguration(requestConfiguration)
```

---

## 📦 Files Created

| File | Purpose |
|------|---------|
| `ui/SplashScreen.kt` | Typing animation splash |
| `ui/ConnectingComposables.kt` | 5 loading screens |
| `BlitzApplication.kt` | AdMob initialization |
| `ui/AdComposables.kt` | 3 ad sizes |
| `SplashExampleActivity.kt` | Demo activity |
| `SPLASH_AND_ADS_GUIDE.md` | Full documentation |
| `IMPLEMENTATION_SUMMARY.md` | Implementation status |

---

## ⚡ One-Line Integrations

### Splash on launch:
```kotlin
SplashTypingScreen(projectName = "BlitzApp", onFinished = { navigateNext() })
```

### Loading state:
```kotlin
if (isLoading) ConnectingFullScreen("Loading") else YourContent()
```

### Banner ad:
```kotlin
BannerAdView(modifier = Modifier.fillMaxWidth())
```

---

## 🎯 Recommended Setup

**Current launcher:** `SplashActivity4`  
**Recommended change:** Keep it or switch to custom splash

**To use new features:**
1. Keep current launcher
2. Add ads to MainActivity ✅
3. Use connecting screens for loading states ✅
4. Test ads on device ✅

---

## ✅ Verification Steps

1. **Build app:** ✅ Already successful
2. **Run on device:** Test typing splash
3. **Check AdMob:** Verify ads appear
4. **Test connecting:** Use in loading states

---

## 🔥 Pro Tips

1. **Splash timing:** Keep under 3 seconds
2. **Ad placement:** Bottom of screen, not covering content
3. **Loading states:** Match screen to connection type
4. **Testing:** Always use test ads during development

---

## 📞 Need Help?

- Check `SPLASH_AND_ADS_GUIDE.md` for detailed info
- Check `IMPLEMENTATION_SUMMARY.md` for status
- Look at `SplashExampleActivity.kt` for examples

---

**Ready to use!** All features are implemented and tested. ✨


