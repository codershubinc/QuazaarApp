# Quazaar

<div align="center">
  <img src="./assets/icon.png" alt="Quazaar Logo" width="200" />
  
  **A Modern System Monitoring & Control Dashboard**
  
  [![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~54.0-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
</div>

## 📖 Overview

Quazaar is a powerful, modern React Native application that provides real-time system monitoring and control capabilities. Built with Expo and TypeScript, it offers a sleek, dark/neon-themed interface for monitoring your system's performance, controlling media playback, managing Bluetooth devices, and much more—all from your mobile device.

## ✨ Key Features

### 🎵 Media Control
- **Now Playing Card**: Real-time display of currently playing media with album artwork
- **Media Controls**: Play, pause, skip, and control media playback remotely
- **Progress Tracking**: Visual progress bar with track duration (auto-detects microsecond/millisecond/second formats)

### 🔧 System Monitoring
- **System Stats**: CPU, RAM, and disk usage with real-time updates
- **System Information**: Display OS, distro, kernel version, and uptime
- **Battery Monitor**: Track both device and remote system battery levels with charging status
- **Network Info**: WiFi connection details and network statistics

### 🎮 System Controls
- **Volume Control**: Adjust system volume with interactive sliders
- **Brightness Control**: Control screen brightness remotely
- **Audio Output**: Select and switch between audio output devices
- **Quick Actions**: Execute common system commands with one tap

### 🔵 Connectivity
- **Bluetooth Manager**: View and manage Bluetooth devices
- **Device Connection**: Connect/disconnect Bluetooth devices remotely
- **WebSocket Integration**: Real-time communication with host system

### ⏱️ Productivity Tools
- **Pomodoro Timer**: Built-in Pomodoro technique timer for productivity
- **Todo List**: Track tasks with add, complete, and delete functionality
- **Activity Feed**: Monitor recent system activities and events

### 📊 Developer Stats (Optional)
- **GitHub Stats**: Display your GitHub contribution statistics
- **WakaTime Integration**: Track coding time and activity
- **Language Stats**: View your top programming languages
- **Streak Display**: Maintain and display your coding streaks

### 🎨 User Experience
- **Modern UI/UX**: Dark theme with gradient backgrounds and neon accents (Indigo/Cyan/Magenta)
- **Responsive Design**: Adapts to both portrait and landscape orientations
- **Smooth Animations**: Polished animations and transitions throughout
- **Toast Notifications**: Non-intrusive feedback for user actions
- **Splash Screen**: Branded splash screen on app launch
- **Fact Popup**: Random interesting facts displayed periodically

### 🔐 Security
- **Token-based Authentication**: Secure authentication with token storage
- **Login Screen**: User authentication before accessing system features

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo ~54.0
- **Language**: TypeScript 5.9.3
- **State Management**: Zustand 5.0.9
- **Storage**: AsyncStorage
- **UI Components**:
  - Expo Linear Gradient
  - React Native SVG
  - React Native Safe Area Context
  - Expo Image
- **System APIs**:
  - Expo Battery
  - Expo Navigation Bar
  - Expo Document Picker
  - Expo Status Bar
- **Communication**: WebSocket for real-time data

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **Bun** (for package management) or **npm**/**yarn**
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Android Studio** (for Android development) with:
  - Android SDK
  - JDK 17
- **Xcode** (for iOS development, macOS only)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/codershubinc/QuazaarApp.git
   cd QuazaarApp
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   # or
   bun start
   ```

## 📱 Usage

### Running on Android
```bash
npm run android
```

### Running on iOS
```bash
npm run ios
```

### Running on Web
```bash
npm run web
```

### Building APK
```bash
npm run build:apk
```

For detailed build instructions, see [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md).

## 📁 Project Structure

```
QuazaarApp/
├── assets/                 # Images, icons, and static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ActivityFeed.tsx
│   │   ├── BatteryDisplay.tsx
│   │   ├── BluetoothDevicesCard.tsx
│   │   ├── DateTimeCard.tsx
│   │   ├── FactPopup.tsx
│   │   ├── Header.tsx
│   │   ├── NowPlayingCard.tsx
│   │   ├── PomodoroCard.tsx
│   │   ├── QuickActionsCard.tsx
│   │   ├── SystemControlsCard.tsx
│   │   ├── SystemStatsCard.tsx
│   │   ├── TodoCard.tsx
│   │   └── ...
│   ├── screens/           # Screen components
│   │   ├── MainScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── services/          # Business logic and API services
│   │   └── WebSocketService.ts
│   ├── store/             # State management (Zustand)
│   │   └── useAppStore.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── constants/         # App constants and theme
│       └── theme.ts
├── App.tsx                # Main application entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator/device |
| `npm run web` | Run in web browser |
| `npm run build:apk` | Build Android APK with EAS |

## 🔌 WebSocket Connection

Quazaar connects to a WebSocket server for real-time system data. Configure the connection in the Settings screen by providing:
- **Server URL**: WebSocket endpoint (e.g., `ws://192.168.1.100:8080`)
- **Authentication Token**: Your API token for secure access

## 🎨 Theming

The app uses a modern dark theme with neon accents. The theme is centralized in `src/constants/theme.ts` and includes:
- **Primary Colors**: Indigo, Cyan, Magenta
- **Background**: Dark gradient backgrounds
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing units
- **Shadows**: Depth and elevation effects

Customize the theme by editing the theme configuration file.

## 📸 Screenshots

*Screenshots will be added in future updates*

## 🔮 Future Enhancements

- [ ] File upload functionality
- [ ] Widget support for Android home screen
- [ ] More system control options
- [ ] Custom theme builder
- [ ] Multi-device support
- [ ] Offline mode with cached data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed by [codershubinc](https://github.com/codershubinc).

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons and assets from Expo
- State management by [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/codershubinc/QuazaarApp/issues).

---

<div align="center">
  Made with ❤️ by codershubinc
</div>
