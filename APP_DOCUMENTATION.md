# BlitzApp Documentation

Welcome to the BlitzApp documentation! This document provides a comprehensive overview of the app's structure, components, and functionality. It's designed to help you understand how the app is built and how to extend it.

## Project Overview

BlitzApp is a remote control application for your computer. It connects to a WebSocket server, allowing you to control media playback, view system information, and execute quick actions from your Android device.

## Project Structure

The project is organized into the following key files:

- **`MainActivity.kt`**: The entry point of the app. It sets up the UI and initializes the `WebSocketManager`.
- **`MainViewModel.kt`**: The central state holder for the application. It manages the app's data and exposes it to the UI.
- **`DataModels.kt`**: Defines the data structures for `ArtWork`, `MediaInfo`, `BluetoothDevice`, and `WiFiInfo`.
- **`composables.kt`**: Contains all the Jetpack Compose UI components for the app.
- **`WebSocketManager.kt`**: Manages the WebSocket connection to the server.

## Core Components

### MainActivity.kt

The `MainActivity` is the app's entry point. It sets up the UI using Jetpack Compose and initializes a `WebSocketManager` to connect to a server. The UI is split into `MainScreen` and `SettingsScreen`, and it adapts to different screen sizes.

### MainViewModel.kt

The `MainViewModel` acts as the central state holder for the application. It uses `mutableStateOf` to manage various pieces of data, such as connection status, media information, and more. This data is then observed by the UI to automatically update when the state changes.

### DataModels.kt

The `DataModels.kt` file defines the data structures that are used throughout the app. These models represent the data received from the WebSocket server and are used to populate the UI.

## UI Components

The UI is built entirely with Jetpack Compose. The `composables.kt` file contains a variety of reusable components, including:

- **`ErrorCard`**: Displays an error message to the user.
- **`ConnectingCard`**: Shows a loading indicator while the app is connecting to the server.
- **`Header`**: The main header of the app, which displays the app's title and connection status.
- **`ConnectionCard`**: Allows the user to configure the WebSocket connection settings.
- **`NowPlayingCard`**: Displays the currently playing media, including album art, track information, and playback controls.
- **`BluetoothDevicesCard`**: Shows a list of connected Bluetooth devices.
- **`QuickActionsCard`**: Provides a grid of buttons for executing common commands.
- **`SystemOutputCard`**: Displays output from system commands.

## App Functionality

When the app starts, it automatically attempts to connect to a WebSocket server at a default URL. The user can change the connection settings from the `SettingsScreen`. Once connected, the app can:

- **Control Media**: The `NowPlayingCard` allows the user to play, pause, and skip tracks.
- **View System Info**: The app displays information about connected Bluetooth devices and Wi-Fi speed.
- **Execute Quick Actions**: The `QuickActionsCard` provides buttons for running predefined commands on the server.

This documentation should give you a solid starting point for understanding and modifying the BlitzApp. If you have any more questions, feel free to ask!