package com.quazaar.remote

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.windowsizeclass.ExperimentalMaterial3WindowSizeClassApi
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.ads.MobileAds
import com.quazaar.remote.service.MusicService
import com.quazaar.remote.ui.*
import com.quazaar.remote.ui.theme.QuazaarTheme
import com.quazaar.remote.widget.MusicWidgetProvider
import kotlinx.coroutines.launch

enum class Screen {
    MAIN, SETTINGS
}

@OptIn(ExperimentalMaterial3WindowSizeClassApi::class)
class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
    private lateinit var webSocketManager: WebSocketManager
    private lateinit var fileShareManager: FileShareManager

    private val pickFileLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            lifecycleScope.launch {
                fileShareManager.uploadFile(it)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Note: MobileAds is initialized in BlitzApplication

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)

        webSocketManager = WebSocketManager(viewModel, this)
        fileShareManager = FileShareManager(this)

        // Auto-connect on app load with default settings
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        val ip = prefs.getString("ip", "192.168.1.110") ?: "192.168.1.110"
        val port = prefs.getString("port", "8765") ?: "8765"
        val path = prefs.getString("path", "/ws?deviceId=\$2a\$10\$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2") ?: "/ws?deviceId=\$2a\$10\$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2"
        val defaultUrl = "ws://$ip:$port$path"
        webSocketManager.connect(defaultUrl)

        // Start background service to keep widget updated
        MusicService.start(this)

        // Handle widget button actions
        handleWidgetActions(intent)

        setContent {
            QuazaarTheme {
                val windowSizeClass = calculateWindowSizeClass(this)
                val currentScreen = remember { mutableStateOf(Screen.MAIN) }
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    when (currentScreen.value) {
                        Screen.MAIN -> MainScreen(
                            viewModel = viewModel,
                            widthSizeClass = windowSizeClass.widthSizeClass,
                            onConnect = { ip, port, path ->
                                val url = "ws://$ip:$port$path"
                                webSocketManager.connect(url)
                            },
                            onCommand = { command ->
                                when (command) {
                                    "upload_file" -> pickFileLauncher.launch("*/*")
                                    "volume_up" -> webSocketManager.volumeIncrease()
                                    "volume_down" -> webSocketManager.volumeDecrease()
                                    "mute" -> webSocketManager.toggleMute()
                                    "brightness_up" -> webSocketManager.brightnessIncrease()
                                    "brightness_down" -> webSocketManager.brightnessDecrease()
                                    else -> webSocketManager.sendCommand(command)
                                }
                            },
                            onSettingsClick = { currentScreen.value = Screen.SETTINGS }
                        )
                        Screen.SETTINGS -> SettingsScreen(
                            viewModel = viewModel,
                            onConnect = { ip, port, path ->
                                val url = "ws://$ip:$port$path"
                                webSocketManager.connect(url)
                            },
                            onBackClick = { currentScreen.value = Screen.MAIN }
                        )
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleWidgetActions(it) }
    }

    private fun handleWidgetActions(intent: Intent?) {
        when (intent?.action) {
            MusicWidgetProvider.ACTION_PLAY_PAUSE -> {
                webSocketManager.sendCommand("player_toggle")
            }
            MusicWidgetProvider.ACTION_NEXT -> {
                webSocketManager.sendCommand("player_next")
            }
            MusicWidgetProvider.ACTION_PREVIOUS -> {
                webSocketManager.sendCommand("player_prev")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocketManager.close()
    }
}

@Composable
fun MainScreen(
    viewModel: MainViewModel,
    widthSizeClass: WindowWidthSizeClass,
    onConnect: (String, String, String) -> Unit,
    onCommand: (String) -> Unit,
    onSettingsClick: () -> Unit
) {
    val connectionStatus by viewModel.connectionStatus
    val isConnecting by viewModel.isConnecting
    val mediaInfo by viewModel.mediaInfo
    val bluetoothDevices by viewModel.bluetoothDevices
    val wifiInfo by viewModel.wifiInfo
    val commandOutput by viewModel.commandOutput
    val error by viewModel.error
    val artWork by viewModel.artWork
    val musicCardStyle by viewModel.musicCardStyle

    // State to hold dynamic colors
    val dynamicColors = remember { mutableStateOf(DynamicColors()) }

    Box(modifier = Modifier.fillMaxSize()) {
        when (widthSizeClass) {
            WindowWidthSizeClass.Compact -> {
                PortraitLayout(mediaInfo, bluetoothDevices, commandOutput, error, connectionStatus, isConnecting, onConnect, onCommand, artWork, dynamicColors.value, onSettingsClick, musicCardStyle, viewModel, { newColors ->
                    dynamicColors.value = newColors
                })
            }
            else -> {
                LandscapeLayout(mediaInfo, bluetoothDevices, commandOutput, error, connectionStatus, isConnecting, onConnect, onCommand, artWork, dynamicColors.value, onSettingsClick, musicCardStyle, viewModel, { newColors ->
                    dynamicColors.value = newColors
                })
            }
        }
        WifiSpeedIndicator(wifiInfo = wifiInfo)
    }
}

@Composable
@Suppress("UNUSED_PARAMETER")
fun PortraitLayout(
    mediaInfo: MediaInfo?,
    bluetoothDevices: List<BluetoothDevice>,
    commandOutput: String?,
    error: String?,
    connectionStatus: Boolean,
    isConnecting: Boolean,
    onConnect: (String, String, String) -> Unit,
    onCommand: (String) -> Unit,
    artWork: ArtWork?,
    dynamicColors: DynamicColors,
    onSettingsClick: () -> Unit,
    musicCardStyle: MusicCardStyle,
    viewModel: MainViewModel,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Header
        item {
            Header(dynamicColors = dynamicColors, onSettingsClick = onSettingsClick, isConnected = connectionStatus)
        }

        item {
            DateTimeCard()
        }

        // Connecting Card (shown when connecting, hidden when connected)
        if (isConnecting && !connectionStatus) {
            item {
                ConnectingCard()
            }
        }

        // Error Card
        if (!error.isNullOrEmpty()) {
            item {
                ErrorCard(error = error)
            }
        }

        // Now Playing (main tile)
        item {
            NowPlayingCard(mediaInfo = mediaInfo, onCommand = onCommand, dynamicColors = dynamicColors, onColorsUpdate = onColorsUpdate, musicCardStyle = musicCardStyle)
        }

        // Bluetooth Devices
        if (bluetoothDevices.isNotEmpty()) {
            item {
                BluetoothDevicesCard(devices = bluetoothDevices, dynamicColors = dynamicColors)
            }
        }

        // Quick Actions
        item {
            QuickActionsCard(
                onCommand = onCommand,
                dynamicColors = dynamicColors,
                onThemeChange = { style -> viewModel.saveCardStyle(style) }
            )
        }

        // System Controls (Volume & Brightness)
        item {
            val volumeLevel by viewModel.volumeLevel
            val isMuted by viewModel.isMuted
            val brightnessLevel by viewModel.brightnessLevel

            SystemControlsCard(
                volumeLevel = volumeLevel,
                isMuted = isMuted,
                brightnessLevel = brightnessLevel,
                onVolumeUp = { onCommand("volume_up") },
                onVolumeDown = { onCommand("volume_down") },
                onToggleMute = { onCommand("mute") },
                onBrightnessUp = { onCommand("brightness_up") },
                onBrightnessDown = { onCommand("brightness_down") },
                dynamicColors = dynamicColors
            )
        }

        // System Output
        if (!commandOutput.isNullOrEmpty()) {
            item {
                SystemOutputCard(output = commandOutput, dynamicColors = dynamicColors)
            }
        }

        // Banner Ad at bottom
        item {
            LargeBannerAdView()
        }
    }
}

@Composable
@Suppress("UNUSED_PARAMETER")
fun LandscapeLayout(
    mediaInfo: MediaInfo?,
    bluetoothDevices: List<BluetoothDevice>,
    commandOutput: String?,
    error: String?,
    connectionStatus: Boolean,
    isConnecting: Boolean,
    onConnect: (String, String, String) -> Unit,
    onCommand: (String) -> Unit,
    artWork: ArtWork?,
    dynamicColors: DynamicColors,
    onSettingsClick: () -> Unit,
    musicCardStyle: MusicCardStyle,
    viewModel: MainViewModel,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    Row(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {
            Header(dynamicColors = dynamicColors, onSettingsClick = onSettingsClick, isConnected = connectionStatus)
            DateTimeCard()
            // Connecting Card (shown when connecting, hidden when connected)
            if (isConnecting && !connectionStatus) {
                ConnectingCard()
            }

            NowPlayingCard(mediaInfo = mediaInfo, onCommand = onCommand, dynamicColors = dynamicColors, onColorsUpdate = onColorsUpdate, musicCardStyle = musicCardStyle)

            // Banner Ad at bottom of left column
            BannerAdView()
        }
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(top = 80.dp)
        ) {
            if (!error.isNullOrEmpty()) {
                ErrorCard(error = error)
            }
            if (bluetoothDevices.isNotEmpty()) {
                BluetoothDevicesCard(devices = bluetoothDevices, dynamicColors = dynamicColors)
            }
            QuickActionsCard(
                onCommand = onCommand,
                dynamicColors = dynamicColors,
                onThemeChange = { style -> viewModel.saveCardStyle(style) }
            )

            // System Controls (Volume & Brightness)
            val volumeLevel by viewModel.volumeLevel
            val isMuted by viewModel.isMuted
            val brightnessLevel by viewModel.brightnessLevel

            SystemControlsCard(
                volumeLevel = volumeLevel,
                isMuted = isMuted,
                brightnessLevel = brightnessLevel,
                onVolumeUp = { onCommand("volume_up") },
                onVolumeDown = { onCommand("volume_down") },
                onToggleMute = { onCommand("mute") },
                onBrightnessUp = { onCommand("brightness_up") },
                onBrightnessDown = { onCommand("brightness_down") },
                dynamicColors = dynamicColors
            )

            if (!commandOutput.isNullOrEmpty()) {
                SystemOutputCard(output = commandOutput, dynamicColors = dynamicColors)
            }
        }
    }
}
