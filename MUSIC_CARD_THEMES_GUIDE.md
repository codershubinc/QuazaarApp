# Music Card Themes Guide

## Overview
The BlitzApp now features **4 distinct music card themes** that can be switched on-the-fly using test buttons in the Quick Actions section. Each theme offers a unique visual experience while maintaining full functionality.

---

## Available Themes

### 🎵 Modern Theme (Default)
**Design Philosophy:** Sleek, glassmorphic design with smooth animations

**Key Features:**
- Glassmorphism effect with blurred background
- Large 240dp album artwork with elevated shadow
- Gradient overlay for depth
- Real-time status indicator (PLAYING/PAUSED) with colored dot
- Clean typography with ample spacing
- 6dp tall progress bar with dynamic colors
- Circular control buttons with semi-transparent backgrounds
- Prominent primary-colored play/pause button

**Visual Style:**
- Background: Blurred album art with gradient overlay
- Color Scheme: Dark with dynamic accent colors from artwork
- Typography: Modern sans-serif with proper hierarchy
- Borders: Rounded corners (24dp)

---

### 💡 Neon Theme
**Design Philosophy:** Retro cyberpunk aesthetic with pulsing neon effects

**Key Features:**
- Animated pulsing glow effect on borders and text
- Dual-color neon scheme (Cyan #00FFFF + Magenta #FF00FF)
- Gradient borders that pulse with the music
- Monospace font for retro-futuristic feel
- Custom neon progress bar with horizontal gradient
- Pure black background for maximum contrast
- Border-style circular controls with neon glow

**Visual Style:**
- Background: Pure black (#000000)
- Color Scheme: Neon cyan/magenta with pulsing animations
- Typography: Monospace fonts with wide letter spacing
- Borders: Multiple gradient borders with glow effects
- Special Effects: Infinite pulsing animation (1s cycle)

**Unique Elements:**
- Header: "◢◤ NEON PLAYER ◥◣"
- Artist prefix: "▸ Artist Name"
- No signal state: "∿∿∿ NO SIGNAL ∿∿∿"

---

### 📱 Minimal Theme
**Design Philosophy:** Compact, content-first horizontal layout

**Key Features:**
- Horizontal row layout (album + info + controls)
- Compact 80dp album artwork
- Space-efficient design ideal for landscape
- Ultra-thin 3dp progress bar
- White monochrome color scheme
- Vertical control stack on the right
- Smallest file size and memory footprint
- No elevation or shadows

**Visual Style:**
- Background: Dark gray (#0F0F0F)
- Color Scheme: White on dark with minimal color
- Typography: Clean, small text optimized for readability
- Borders: Small rounded corners (8-12dp)
- Layout: Horizontal row with 3 sections

**Best For:**
- Users who prefer compact UIs
- Landscape/tablet mode
- Low-power displays
- Quick glance information

---

### 🎼 Classic Theme (Original)
**Design Philosophy:** Rich, immersive experience with blur effects

**Key Features:**
- Full background blur with animated blur amount
- Dynamic blur based on playback state (30dp playing, 50dp paused)
- Animated overlay alpha that changes with music
- Large album art with aspect ratio preservation
- Smooth crossfade transitions between tracks
- Color extraction from artwork for dynamic theming
- Spring animations for card scaling
- Comprehensive position/duration display

**Visual Style:**
- Background: Heavily blurred album artwork
- Color Scheme: Fully dynamic based on album art
- Typography: MaterialTheme typography with hierarchy
- Borders: Moderate rounded corners (16dp)
- Animations: Spring-based, smooth transitions

**Technical Features:**
- Base64 image decoding support
- AsyncImage loading with color extraction
- AnimatedContent for smooth transitions
- Spring animations with custom damping

---

## How to Switch Themes

### Using Quick Actions Buttons

In the app's main screen, scroll to the **Quick Actions** card. Below the standard quick action buttons, you'll find a section titled:

**🎨 Music Card Theme**

Four buttons allow instant theme switching:
1. **🎵 Modern** - Default modern theme
2. **💡 Neon** - Neon/cyberpunk theme
3. **📱 Minimal** - Compact minimal theme
4. **🎼 Classic** - Original immersive theme

Simply tap any button to instantly switch the music card theme. The change is immediate with smooth transitions.

---

## Implementation Details

### File Structure
```
app/src/main/java/com/quazaar/remote/
├── MainViewModel.kt          # Contains MusicCardStyle enum and state
├── MainActivity.kt            # Passes theme state to composables
└── ui/composables.kt          # Theme implementations
    ├── NowPlayingCard()       # Theme switcher
    ├── NowPlayingCardModern() # Modern theme
    ├── NowPlayingCardNeon()   # Neon theme
    ├── NowPlayingCardMinimal()# Minimal theme
    └── NowPlayingCardClassic()# Classic theme
```

### State Management
```kotlin
enum class MusicCardStyle {
    MODERN, NEON, MINIMAL, CLASSIC
}

class MainViewModel : ViewModel() {
    val musicCardStyle = mutableStateOf(MusicCardStyle.MODERN)
    
    fun setMusicCardStyle(style: MusicCardStyle) {
        musicCardStyle.value = style
    }
}
```

### Theme Switching Logic
```kotlin
@Composable
fun NowPlayingCard(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit,
    musicCardStyle: MusicCardStyle = MusicCardStyle.MODERN
) {
    when (musicCardStyle) {
        MusicCardStyle.MODERN -> NowPlayingCardModern(...)
        MusicCardStyle.NEON -> NowPlayingCardNeon(...)
        MusicCardStyle.MINIMAL -> NowPlayingCardMinimal(...)
        MusicCardStyle.CLASSIC -> NowPlayingCardClassic(...)
    }
}
```

---

## Performance Characteristics

### Modern Theme
- **Memory:** Medium (blur effects + large images)
- **CPU:** Medium (gradient animations)
- **Battery:** Medium
- **Best For:** Modern devices with good GPUs

### Neon Theme
- **Memory:** Low-Medium (no blur, simple effects)
- **CPU:** Medium (infinite animations)
- **Battery:** Medium (constant animation)
- **Best For:** Devices that handle animations well

### Minimal Theme
- **Memory:** Low (smallest images, no blur)
- **CPU:** Low (minimal animations)
- **Battery:** Best (most efficient)
- **Best For:** Battery-conscious users, older devices

### Classic Theme
- **Memory:** High (full blur + large images)
- **CPU:** High (complex animations + color extraction)
- **Battery:** Highest usage
- **Best For:** Flagship devices, desktop mode

---

## Customization Guide

### Adding a New Theme

1. **Create the theme function** in `composables.kt`:
```kotlin
@Composable
fun NowPlayingCardYourTheme(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    // Your theme implementation
}
```

2. **Add to enum** in `MainViewModel.kt`:
```kotlin
enum class MusicCardStyle {
    MODERN, NEON, MINIMAL, CLASSIC, YOURTHEME
}
```

3. **Add to switch** in `NowPlayingCard()`:
```kotlin
MusicCardStyle.YOURTHEME -> NowPlayingCardYourTheme(...)
```

4. **Add button** in `QuickActionsCard()`:
```kotlin
MusicCardStyle.YOURTHEME to "🎨 Your Theme"
```

---

## Testing

### Manual Testing Checklist
- [ ] All 4 themes load without errors
- [ ] Theme switching is instant and smooth
- [ ] Album artwork displays correctly in all themes
- [ ] Progress bars update in real-time
- [ ] Control buttons work (play, pause, next, prev)
- [ ] Theme persists during track changes
- [ ] Text is readable in all themes
- [ ] Colors update based on album artwork
- [ ] Animations perform smoothly
- [ ] No memory leaks when switching themes

### Performance Testing
```bash
# Monitor memory usage
adb shell dumpsys meminfo com.quazaar.remote

# Check for jank/dropped frames
adb shell dumpsys gfxinfo com.quazaar.remote
```

---

## Build Status

✅ **Successfully Compiled**
- All themes implemented with unique designs
- No compilation errors
- Only minor warnings (unused imports)
- Ready for testing and deployment

---

## Future Enhancements

### Potential Additions
1. **Retro/Vinyl Theme** - Spinning record animation
2. **Transparent Theme** - See-through card with background
3. **Gradient Theme** - Animated gradient backgrounds
4. **Material You Theme** - Dynamic color from system
5. **Neumorphism Theme** - Soft UI with shadows
6. **Dark Mode Toggle** - Per-theme dark/light variants
7. **Custom Theme Builder** - User-created themes
8. **Theme Persistence** - Save preference to SharedPreferences

### Animation Improvements
- Transition animations when switching themes
- More sophisticated neon pulse effects
- Particle effects for modern theme
- Vinyl spin animation for classic theme

---

## Troubleshooting

### Theme Not Changing
- Ensure ViewModel state is properly observed
- Check that theme buttons are calling `viewModel.setMusicCardStyle()`
- Verify `musicCardStyle` is passed to `NowPlayingCard`

### Performance Issues
- Try switching to Minimal theme for best performance
- Disable animations in device settings if needed
- Check for memory leaks with profiler

### Visual Glitches
- Clear app cache and rebuild
- Check for conflicting styles in theme definitions
- Verify bitmap decoding is working properly

---

## Credits

**Developer:** SwapnilSinghal03 (GitHub: swap)
**App:** BlitzApp (Quazaar Remote Control)
**Date:** December 2025
**Version:** 1.0 with Multi-Theme Support

---

*For more information, see the main [APP_DOCUMENTATION.md](./APP_DOCUMENTATION.md)*

