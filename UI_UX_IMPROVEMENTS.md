# UI/UX Improvements

The application has been updated with a consistent, modern, dark/neon theme.

## Changes

### Theme

- Created `src/constants/theme.ts` with a centralized color palette (Indigo/Cyan/Magenta), spacing, typography, and shadows.
- Applied `LinearGradient` backgrounds to cards and screens for a premium look.

### Components

- **NowPlayingCard**: Updated with gradient background, themed progress bar, and Ionicons.
- **SystemControlsCard**: Updated sliders with gradients and themed icons.
- **QuickActionsCard**: Updated grid layout with gradient buttons and themed icons. Added "Upload File" action placeholder.
- **BluetoothDevicesCard**: Updated list items with themed icons and badges. Added a refresh/scan button.
- **SystemOutputCard**: Updated console look with themed colors and transparency.
- **DateTimeCard**: Updated typography and layout.
- **Header**: Updated status indicator and settings button.

### Screens

- **MainScreen**: Applied global background gradient and updated layout.
- **SettingsScreen**: Themed input fields, buttons, and cards.
- **SplashScreen**: Updated colors and animations to match the theme.

### Services

- **WebSocketService**: Updated `sendCommand` to support payloads (e.g., for Bluetooth connection).

## Next Steps

- Implement actual file upload logic in `WebSocketService`.
- Test on a physical device to ensure layout responsiveness on different screen sizes.
