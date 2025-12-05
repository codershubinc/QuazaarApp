# Splash Screens

The Quazaar app comes with four unique and production-ready splash screen designs. Each splash screen is designed to provide a visually appealing and informative loading experience.

## 📊 Splash Screen Designs

| # | Name | File | Style | Duration | Best For |
|---|---|---|---|---|---|
| 1 | **Typing** | `SplashActivity.kt` | Classic typing | 2.3s | Fast, retro feel |
| 2 | **Rotating Logo** | `SplashActivity2.kt` | Modern dynamic | 3.8s | Premium visual |
| 3 | **Minimalist** | `SplashActivity3.kt` | Clean elegant | 3.8s | Professional |
| 4 | **Server Connect** | `SplashActivity4.kt` | Network loading | 6.5s | Server apps |

## 🚀 How to Switch Between Splash Screens

1.  **Open `AndroidManifest.xml`**
2.  **Find the Launcher Activity**: Locate the `<activity>` tag with the `<intent-filter>` for `android.intent.action.MAIN` and `android.intent.category.LAUNCHER`.
3.  **Change the `android:name`** attribute to the desired splash screen activity (e.g., `.SplashActivity2`).
4.  **Build and run** the app.

**Example for `SplashActivity2`:**
```xml
<activity android:name=".SplashActivity2">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

## 🎨 Design Details

### Design 1: Typing Animation ⌨️
*   **File:** `SplashActivity.kt`
*   **Features:** Character-by-character typing, blinking cursor, and loading dots animation.
*   **Best for:** Speed-focused apps and a retro aesthetic.

### Design 2: Rotating Logo 🔄
*   **File:** `SplashActivity2.kt`
*   **Features:** Rotating logo, animated background circles, fade-in text, and a progress bar.
*   **Best for:** A premium feel and visual impact.

### Design 3: Minimalist ✨
*   **File:** `SplashActivity3.kt`
*   **Features:** Expanding underline, circular progress indicator, and an elegant design.
*   **Best for:** Professional and business-oriented apps.

### Design 4: Server Connection 🌐
*   **File:** `SplashActivity4.kt`
*   **Features:** Pulsing connection icon, status cycling, wave loading animation, and connection statistics.
*   **Best for:** Apps that connect to a server, like Quazaar.
