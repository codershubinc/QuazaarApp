package com.quazaar.remote

import com.google.gson.annotations.SerializedName
import com.google.gson.JsonElement

// Generic server response wrapper
data class ServerResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T? = null
)

// Non-generic version for initial parsing
data class RawServerResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: JsonElement? = null
)

data class ArtWork(
    val url: String?
)

data class MediaInfo(
    @SerializedName("Title") val title: String?,
    @SerializedName("Artist") val artist: String?,
    @SerializedName("Album") val album: String?,
    @SerializedName("Artwork") val albumArt: String?,
    @SerializedName("Length") val duration: Double?,
    @SerializedName("Position") val position: Double?,
    @SerializedName("Status") val status: String?,
    @SerializedName("Player") val player: String? = null
)

data class BluetoothDevice(
    @SerializedName("name") val name: String?,
    @SerializedName("macAddress") val macAddress: String?,
    @SerializedName("connected") val connected: Boolean,
    @SerializedName("battery") val battery: Int?,
    @SerializedName("icon") val icon: String?
)

data class WiFiInfo(
    @SerializedName("ssid") val ssid: String?,
    @SerializedName("signalStrength") val signalStrength: Int?,
    @SerializedName("linkSpeed") val linkSpeed: Int?,
    @SerializedName("frequency") val frequency: String?,
    @SerializedName("security") val security: String?,
    @SerializedName("ipAddress") val ipAddress: String?,
    @SerializedName("connected") val connected: Boolean?,
    @SerializedName("downloadSpeed") val downloadSpeed: Double?,
    @SerializedName("uploadSpeed") val uploadSpeed: Double?,
    @SerializedName("interface") val interfaceName: String?,
    @SerializedName("unitOfSpeed") val unitOfSpeed: String?
)

// System Control Commands for Volume & Brightness
data class SystemCommand(
    val type: String = "system",
    val msg_of: String, // "volume" or "brightness"
    val action: String, // "inc", "dec", "set", "mute", "get"
    val set_to_vol: Int? = null, // For volume set
    val set_to: Int? = null      // For brightness set
)

// System Status Response
data class SystemStatus(
    @SerializedName("type") val type: String?,
    @SerializedName("msg_of") val msgOf: String?, // "volume" or "brightness"
    @SerializedName("value") val value: Int?,
    @SerializedName("muted") val muted: Boolean? = false
)
