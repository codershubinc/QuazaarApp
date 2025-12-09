# Project Structure

The Quazaar app is organized into a modular and maintainable structure. This document provides an overview of the key files and directories in the project.

## 📁 Key Files

*   **`app/src/main/java/com/quazaar/remote/MainActivity.kt`**: The main entry point of the app. It sets up the UI and initializes the `WebSocketManager` and `FileShareManager`.
*   **`app/src/main/java/com/quazaar/remote/MainViewModel.kt`**: The central state holder for the application. It manages the app's data and exposes it to the UI.
*   **`app/src/main/java/com/quazaar/remote/DataModels.kt`**: Defines the data structures for `ArtWork`, `MediaInfo`, `BluetoothDevice`, and `WiFiInfo`.
*   **`app/src/main/java/com/quazaar/remote/ui/composables.kt`**: Contains all the Jetpack Compose UI components for the app.
*   **`app/src/main/java/com/quazaar/remote/WebSocketManager.kt`**: Manages the WebSocket connection to the server.
*   **`app/src/main/java/com/quazaar/remote/FileShareManager.kt`**: Manages file sharing with the server.
*   **`app/src/main/java/com/quazaar/remote/api/FileShareApi.kt`**: Defines the Retrofit API for file sharing.
*   **`app/src/main/java/com/quazaar/remote/api/RetrofitInstance.kt`**: Provides the Retrofit instance for network communication.

## ディレクトリ構造

```
/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/quazaar/remote/
│   │   │   │   ├── api/               # Retrofit API
│   │   │   │   ├── ui/                # Jetpack Compose UI
│   │   │   │   ├── BlitzApplication.kt
│   │   │   │   ├── DataModels.kt
│   │   │   │   ├── FileShareManager.kt
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── MainViewModel.kt
│   │   │   │   ├── SplashActivity.kt
│   │   │   │   ├── ...
│   │   │   │   └── WebSocketManager.kt
│   │   │   ├── res/                   # Resources
│   │   │   └── AndroidManifest.xml
├── docs/
│   ├── features/
│   ├── development/
│   └── ...
└── ...
```
