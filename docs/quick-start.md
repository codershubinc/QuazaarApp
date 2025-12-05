# Quick Start Guide

This guide will help you get the Quazaar app up and running quickly.

## 🛠️ Setup

To build and run this project, you will need:

1.  Android Studio Iguana | 2023.2.1 or later.
2.  A connected Android device or emulator.
3.  A running instance of the corresponding Quazaar server on your computer.

**Steps:**

1.  Clone the repository.
2.  Open the project in Android Studio.
3.  In `app/src/main/java/com/quazaar/remote/api/RetrofitInstance.kt`, update the `BASE_URL` with the IP address and port of your server.
    ```kotlin
    const val BASE_URL = "http://YOUR_COMPUTER_IP:8765"
    ```
4.  You can also change the connection details at runtime from the settings screen in the app.
5.  Run the app on your device or emulator.

## 🚀 Using the Features

### 1️⃣ Add Typing Splash to Any Activity

```kotlin
class YourActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                SplashTypingScreen(
                    projectName = "Quazaar",
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
