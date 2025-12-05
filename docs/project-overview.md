# Project Overview

Quazaar is a remote control application for your computer. It connects to a WebSocket server, allowing you to control media playback, view system information, and execute quick actions from your Android device.

## ✨ Features

*   **Media Control:** Play, pause, and skip tracks with ease.
*   **Dynamic Theming:** The UI color scheme dynamically adapts based on the album art of the currently playing media.
*   **System Information:** View details about connected Bluetooth devices and real-time WiFi speed.
*   **Quick Actions:** Execute predefined commands on your computer with a single tap.
*   **Responsive UI:** The layout adapts to both portrait and landscape orientations.
*   **Multiple Splash Screens:** Choose from several animated splash screens.
*   **Customizable UI Themes:** Multiple themes for the music player card.
*   **AdMob Integration:** Monetization through Google AdMob.

## 🚀 Tech Stack

*   **UI:** 100% [Jetpack Compose](https://developer.android.com/jetpack/compose) for a modern, declarative UI.
*   **Architecture:** Follows the MVVM (Model-View-ViewModel) pattern.
*   **State Management:** Uses `mutableStateOf` to manage UI state.
*   **Networking:** [OkHttp](https://square.github.io/okhttp/) for WebSocket communication and [Retrofit](https://square.github.io/retrofit/) for HTTP requests.
*   **Asynchronous Operations:** Coroutines for managing background threads.
*   **Image Loading:** [Coil](https://coil-kt.github.io/coil/) for loading and displaying images.
*   **Monetization:** [Google AdMob](https://admob.google.com/) for in-app advertising.
