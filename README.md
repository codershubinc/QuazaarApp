# Quazaar: Remote Control for Your Computer

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
*   **Networking:** [OkHttp](https.square.github.io/okhttp/) for WebSocket communication and [Retrofit](https.square.github.io/retrofit/) for HTTP requests.
*   **Asynchronous Operations:** Coroutines for managing background threads.
*   **Image Loading:** [Coil](https://coil-kt.github.io/coil/) for loading and displaying images.
*   **Monetization:** [Google AdMob](https://admob.google.com/) for in-app advertising.

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Android Studio
*   A WebSocket server (you'll need to set this up separately)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/QuazaarApp.git
    ```
2.  Open the project in Android Studio.
3.  Build and run the app on an Android device or emulator.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request