# Quick Start - Testing New Features

## 🚀 Getting Started

### Build & Run

```bash
cd /home/swap/Github/QuazaarApp
./gradlew assembleDebug
# or
./gradlew installDebug  # Install to connected device
```

The build was successful! ✅

---

## 📱 Feature Testing Guide

### 1. **Clean Header**
- ✅ **Status**: Launch the app
- **Expected**: 
  - No "QUAZAAR REMOTE" title text
  - Settings icon (⚙️) visible at top right
  - Connection status indicator (green/red dot)
  
---

### 2. **Persistent Settings**
- **Test 1**: Configure Connection
  1. Click Settings icon (⚙️)
  2. Change IP Address to a different value
  3. Change Port to a different value
  4. Click "CONNECT"
  5. Go back to main screen
  6. Close and fully kill the app
  7. Reopen app
  8. **Expected**: IP and Port are restored from last session

- **Test 2**: Theme Persistence
  1. Click Settings icon (⚙️)
  2. Select different theme (e.g., "💡 Neon")
  3. Go back to main screen
  4. **Expected**: Theme immediately applied
  5. Close and reopen app
  6. **Expected**: Neon theme is still applied

---

### 3. **Settings Page**
- **Location**: Click ⚙️ icon at top right
- **Features to Test**:
  - [ ] Back arrow (←) returns to main screen
  - [ ] Title reads "⚙️ Settings"
  - [ ] Connection Card visible with IP/Port/Path inputs
  - [ ] Theme Settings Card shows all 8 themes
  - [ ] Current theme is highlighted
  - [ ] Content is scrollable on small screens

---

### 4. **Date & Time Widget**
- **Location**: Below the "Now Playing" card
- **Features to Test**:
  - [ ] Date displays in format: "Monday, December 5, 2024"
  - [ ] Time displays in 24-hour format: "14:30:45"
  - [ ] Monospace font used for time
  - [ ] Click "🔄 Refresh" button
  - [ ] Time updates after refresh
  - [ ] Card appears in both portrait and landscape modes
  - [ ] Border and gradient match theme color

---

### 5. **Test Button**
- **Location**: Quick Actions card
- **How to Test**:
  1. Find Quick Actions section
  2. Look for ✅ button (last button in the row)
  3. Click it
  4. Check server/console logs
  5. **Expected**: "test" command sent to server

---

### 6. **Themed Music Cards**
- **How to Test Theme Switching**:
  1. Click Settings icon (⚙️)
  2. In "🎨 Music Card Theme" section, click one of:
     - 🎵 Modern
     - 💡 Neon
     - 📱 Minimal
     - 🎼 Classic
     - 💿 Vinyl
     - 🌈 Gradient
     - ◉ Neumorphic
     - 👾 Retro
  3. Go back to main screen
  4. **Expected**: Music player card rendered in selected theme

- **Visual Indicators**:
  - Active theme button is highlighted/bright
  - Inactive theme buttons are dimmed

---

### 7. **Layout Responsiveness**
- **Portrait Mode**:
  - [ ] Header at top with settings icon
  - [ ] Now Playing card
  - [ ] Date & Time card below it
  - [ ] Quick Actions card
  - [ ] Bluetooth devices (if available)

- **Landscape Mode**:
  - [ ] Two-column layout
  - [ ] Date & Time card on right column
  - [ ] All cards visible without horizontal scroll
  - [ ] Responsive design maintained

---

## 🧰 Troubleshooting

### Settings Not Persisting
- **Cause**: SharedPreferences not initialized
- **Fix**: Check MainActivity.onCreate() calls `viewModel.initializePreferences(this)`

### Theme Not Changing
- **Cause**: Music card theme binding issue
- **Fix**: Verify `musicCardStyle` is being observed in NowPlayingCard

### Date/Time Not Updating
- **Cause**: updateDateTime() not called
- **Fix**: Click refresh button or call `viewModel.updateDateTime()`

### Build Errors
```bash
# Clean build
./gradlew clean build --no-daemon

# Clear Gradle cache
rm -rf ~/.gradle/caches

# Rebuild
./gradlew assembleDebug --no-daemon
```

---

## 📊 Verification Checklist

- [ ] **Header**: No title, only settings icon and status dot
- [ ] **Settings Icon**: Works and navigates to settings
- [ ] **Settings Screen**: Shows connection and theme options
- [ ] **Connection Settings**: IP/Port saved and restored
- [ ] **Theme Selection**: All 8 themes available
- [ ] **Theme Persistence**: Theme saved across restarts
- [ ] **Date/Time Card**: Shows current date and time
- [ ] **Refresh Button**: Updates time when clicked
- [ ] **Test Button**: Visible in Quick Actions
- [ ] **Layout**: Works in both portrait and landscape
- [ ] **Build Status**: Compiles without errors

---

## 🎯 Key Files Modified

| File | Changes |
|------|---------|
| `MainViewModel.kt` | Added SharedPreferences, DateTime, saving methods |
| `MainActivity.kt` | Initialize SharedPreferences, add DateTimeCard |
| `ui/composables.kt` | Updated Header, added DateTimeCard, ThemeSettingsCard |

---

## 💾 Shared Preferences Keys

| Key | Type | Default |
|-----|------|---------|
| `ip_address` | String | 192.168.1.109 |
| `port` | String | 8765 |
| `path` | String | /ws |
| `music_card_style` | String | MODERN |

**Storage Location**: `/data/data/com.quazaar.remote/shared_prefs/quazaar_settings.xml`

---

## 🎬 Demo Scenarios

### Scenario 1: First-Time User
1. Launch app
2. See clean header with settings icon
3. Use default settings to connect
4. See all 8 theme options in settings
5. Select favorite theme
6. Theme persists on next launch

### Scenario 2: Returning User
1. Launch app
2. Previous IP/Port auto-loaded
3. Previous theme auto-applied
4. Check time in Date/Time widget
5. Adjust settings if needed

### Scenario 3: Testing Connectivity
1. Launch app
2. See connection status dot (red = disconnected)
3. Go to settings
4. Change connection settings
5. Click CONNECT
6. See status dot turn green
7. Go back to main screen
8. See green indicator in header

---

## 📞 Support

For issues or questions about the implementation:
1. Check the IMPLEMENTATION_GUIDE.md for technical details
2. Review error logs in Android Studio
3. Verify all files were modified correctly
4. Ensure build completes successfully

---

**Last Updated**: December 5, 2025
**Status**: Ready for Testing ✅

