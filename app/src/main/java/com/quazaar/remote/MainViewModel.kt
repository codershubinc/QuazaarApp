package com.quazaar.remote

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import java.time.LocalDateTime

enum class MusicCardStyle {
    MODERN, NEON, MINIMAL, CLASSIC, VINYL, GRADIENT, NEUMORPHIC, RETRO
}

class MainViewModel : ViewModel() {
    val connectionStatus = mutableStateOf(false)
    val isConnecting = mutableStateOf(false)
    val mediaInfo = mutableStateOf<MediaInfo?>(null)
    val artWork = mutableStateOf<ArtWork?>(null) // Added for separate artwork
    val bluetoothDevices = mutableStateOf<List<BluetoothDevice>>(emptyList())
    val wifiInfo = mutableStateOf<WiFiInfo?>(null)
    val commandOutput = mutableStateOf<String?>(null)
    val error = mutableStateOf<String?>(null)
    val musicCardStyle = mutableStateOf(MusicCardStyle.MODERN)
    val currentDateTime = mutableStateOf(LocalDateTime.now())

    // System Controls
    val volumeLevel = mutableStateOf(50)
    val isMuted = mutableStateOf(false)
    val brightnessLevel = mutableStateOf(50)

    // Settings storage
    private var sharedPreferences: SharedPreferences? = null

    // User settings (persisted)
    val savedIpAddress = mutableStateOf("192.168.1.109")
    val savedPort = mutableStateOf("8765")
    val savedPath = mutableStateOf("/ws")

    fun updateConnectionStatus(isConnected: Boolean) {
        connectionStatus.value = isConnected
    }

    fun updateConnectingStatus(connecting: Boolean) {
        isConnecting.value = connecting
    }

    fun updateMediaInfo(info: MediaInfo?) {
        mediaInfo.value = info
    }

    fun updateArtWork(art: ArtWork?) {
        artWork.value = art
    }

    fun updateBluetoothDevices(devices: List<BluetoothDevice>) {
        bluetoothDevices.value = devices
    }

    fun updateWifiInfo(info: WiFiInfo?) {
        wifiInfo.value = info
    }

    fun updateCommandOutput(output: String?) {
        commandOutput.value = output
    }

    fun updateError(errorMessage: String?) {
        error.value = errorMessage
    }

    fun updateVolume(level: Int) {
        volumeLevel.value = level.coerceIn(0, 100)
    }

    fun updateMuteState(muted: Boolean) {
        isMuted.value = muted
    }

    fun updateBrightness(level: Int) {
        brightnessLevel.value = level.coerceIn(0, 100)
    }

    // ...existing code...

    fun initializePreferences(context: Context) {
        sharedPreferences = context.getSharedPreferences("quazaar_settings", Context.MODE_PRIVATE)
        // Load saved settings
        savedIpAddress.value = sharedPreferences?.getString("ip_address", "192.168.1.109") ?: "192.168.1.109"
        savedPort.value = sharedPreferences?.getString("port", "8765") ?: "8765"
        savedPath.value = sharedPreferences?.getString("path", "/ws") ?: "/ws"
        val savedStyle = sharedPreferences?.getString("music_card_style", "MODERN") ?: "MODERN"
        musicCardStyle.value = MusicCardStyle.valueOf(savedStyle)
    }

    fun saveConnectionSettings(ip: String, port: String, path: String) {
        savedIpAddress.value = ip
        savedPort.value = port
        savedPath.value = path
        sharedPreferences?.edit()?.apply {
            putString("ip_address", ip)
            putString("port", port)
            putString("path", path)
            apply()
        }
    }

    fun saveCardStyle(style: MusicCardStyle) {
        musicCardStyle.value = style
        sharedPreferences?.edit()?.apply {
            putString("music_card_style", style.name)
            apply()
        }
    }

    fun updateDateTime() {
        currentDateTime.value = LocalDateTime.now()
    }
}
