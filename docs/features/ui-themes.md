# UI Themes

The Quazaar app features a variety of customizable UI themes for the music player card, allowing users to personalize their experience. All themes are designed to be dark to provide a comfortable viewing experience in low-light environments.

## 🎨 Available Themes

| Theme | Style | Key Features |
|---|---|---|
| **Modern** | Sleek, glassmorphic | Blurred background, gradient overlay, large album art. |
| **Neon** | Retro cyberpunk | Pulsing neon effects, dual-color scheme, monospace font. |
| **Minimal** | Compact, content-first | Horizontal layout, space-efficient, monochrome color scheme. |
| **Classic** | Rich, immersive | Full background blur, dynamic colors from album art, spring animations. |
| **Vinyl** | Vintage, elegant | Dark brown and gold color scheme, spinning record animation. |
| **Gradient** | Animated, vibrant | Animated gradient background, bold text with shadows. |
| **Neumorphic** | Soft, subtle | Dark gray background with soft shadows. |
| **Retro** | 8-bit, terminal | Dark green and bright green color scheme, pixelated font. |

## 🚀 How to Switch Themes

Users can instantly switch between themes using the buttons provided in the **Quick Actions** card on the main screen of the app.

## 🔧 Implementation Details

The theme switching logic is handled in the `MainViewModel` and `composables.kt`.

*   **`MainViewModel.kt`**: Contains the `MusicCardStyle` enum and the state for the current theme.
*   **`composables.kt`**: Implements the different theme composables and the theme switcher logic in `NowPlayingCard`.

### Adding a New Theme

1.  **Create the theme composable** in `composables.kt`.
2.  **Add the new theme** to the `MusicCardStyle` enum in `MainViewModel.kt`.
3.  **Add the new theme** to the `when` statement in the `NowPlayingCard` composable.
4.  **Add a button** for the new theme in the `QuickActionsCard` composable.
