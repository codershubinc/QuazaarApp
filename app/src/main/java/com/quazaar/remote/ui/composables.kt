package com.quazaar.remote.ui

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.quazaar.remote.BluetoothDevice
import com.quazaar.remote.MediaInfo
import com.quazaar.remote.MainViewModel
import com.quazaar.remote.MusicCardStyle
import com.quazaar.remote.R
import com.quazaar.remote.WiFiInfo
import com.quazaar.remote.ui.theme.*
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import com.quazaar.remote.FileShareManager
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay

// Dynamic color data class
data class DynamicColors(
    val primary: Color = PrimaryAccent,
    val secondary: Color = Color(0xFF1F1F1F),
    val background: Color = Color(0xFF121212),
    val surface: Color = Color(0xFF1E1E1E),
    val text: Color = Color.White
)

// Extract dominant color from artwork bitmap
fun extractColorsFromBitmap(bitmap: Bitmap?): DynamicColors {
    if (bitmap == null) return DynamicColors()

    return try {
        // Get dominant color from bitmap - using standard API
        val resized = Bitmap.createScaledBitmap(bitmap, 150, 150, true)

        var dominantColor = PrimaryAccent
        var r = 0L
        var g = 0L
        var b = 0L
        var pixelCount = 0

        for (i in 0 until resized.width) {
            for (j in 0 until resized.height) {
                val pixel = resized.getPixel(i, j)
                r += android.graphics.Color.red(pixel)
                g += android.graphics.Color.green(pixel)
                b += android.graphics.Color.blue(pixel)
                pixelCount++
            }
        }

        if (pixelCount > 0) {
            val avgR = (r / pixelCount).toInt()
            val avgG = (g / pixelCount).toInt()
            val avgB = (b / pixelCount).toInt()
            dominantColor = Color(red = avgR, green = avgG, blue = avgB)
        }

        DynamicColors(
            primary = dominantColor,
            secondary = dominantColor.copy(alpha = 0.6f),
            background = Color(0xFF0D0D0D),
            surface = dominantColor.copy(alpha = 0.1f),
            text = Color.White
        )
    } catch (_: Exception) {
        DynamicColors()
    }
}

// Calculate contrasting/opposite color for better visibility
fun getContrastingColor(color: Color): Color {
    // Calculate luminance
    val luminance = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue)

    // Return white for dark colors, black for light colors
    return if (luminance > 0.5f) Color.Black else Color.White
}

// Get vibrant opposite color for accents
fun getOppositeColor(color: Color): Color {
    return Color(
        red = 1f - color.red,
        green = 1f - color.green,
        blue = 1f - color.blue,
        alpha = 1f
    )
}

// Helper function to format doubles
private fun Double.format(decimals: Int) = "%.${decimals}f".format(this)

// Helper function to format network speed with auto-scaling
private fun formatSpeed(mbps: Double?): String {
    // Log.d("wifi speed" , mbps.toString())
    if (mbps == null) return "0 Kbps"
    return when {
        mbps >= 1000 -> "${(mbps / 1000).format(1)} Gbps"
        mbps >= 1 -> "${mbps.format(1)} Mbps"
        else -> "${(mbps * 1024).toInt()} Kbps"
    }
}

@Composable
fun WifiSpeedIndicator(wifiInfo: WiFiInfo?) {
    // Show the indicator if wifi is connected
    if (wifiInfo != null && wifiInfo.connected == true) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.TopEnd
        ) {
            val downloadSpeed = formatSpeed(wifiInfo.downloadSpeed)
            val uploadSpeed = formatSpeed(wifiInfo.uploadSpeed)
            Text(
                text = "↓$downloadSpeed / ↑$uploadSpeed",
                color = TextSecondary,
                fontSize = 12.sp,
                modifier = Modifier
                    .background(CardBackground.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
fun ErrorCard(error: String?) {
    if (!error.isNullOrEmpty()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Error),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "⚠️", fontSize = 28.sp)
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = error,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}

@Composable
fun ConnectingCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = PrimaryAccent,
                strokeWidth = 3.dp
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "Connecting to server...",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
        }
    }
}

@Composable
fun Header(
    dynamicColors: DynamicColors = DynamicColors(),
    onSettingsClick: (() -> Unit)? = null,
    isConnected: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.End
    ) {
        if (onSettingsClick != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Connection status dot
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(
                            color = if (isConnected) Success else Error,
                            shape = CircleShape
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(onClick = onSettingsClick) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_settings),
                        contentDescription = "Settings",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@Composable
fun ConnectionCard(
    isConnected: Boolean,
    onConnect: (String, String, String) -> Unit,
    dynamicColors: DynamicColors = DynamicColors()
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE) }

    var ipAddress by remember { mutableStateOf(prefs.getString("ip", "192.168.1.109") ?: "192.168.1.109") }
    var port by remember { mutableStateOf(prefs.getString("port", "8765") ?: "8765") }
    var path by remember { mutableStateOf(prefs.getString("path", "/ws") ?: "/ws") }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(text = "🔌 Connection", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = ipAddress,
                onValueChange = { ipAddress = it },
                label = { Text("IP Address") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = port,
                onValueChange = { port = it },
                label = { Text("Port") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = path,
                onValueChange = { path = it },
                label = { Text("Path") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            Spacer(modifier = Modifier.height(20.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(
                    onClick = {
                        prefs.edit()
                            .putString("ip", ipAddress)
                            .putString("port", port)
                            .putString("path", path)
                            .apply()
                        onConnect(ipAddress, port, path)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryAccent),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Text(text = "CONNECT", fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.weight(1f))

                Surface(
                    color = if (isConnected) Success else Error,
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text(
                        text = if (isConnected) "● CONNECTED" else "○ DISCONNECTED",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
@Composable
fun DateTimeCard() {
    var currentTime by remember { mutableStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = System.currentTimeMillis()
            delay(1000)
        }
    }

    val dateFormat = SimpleDateFormat("EEE, MMM d, yyyy", Locale.getDefault())
    val timeFormat = SimpleDateFormat("h:mm:ss a", Locale.getDefault())

    val date = dateFormat.format(Date(currentTime))
    val time = timeFormat.format(Date(currentTime))

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = date,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = time,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryAccent
            )
        }
    }
}
@Composable
fun MusicWidget(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Album art
            if (!mediaInfo?.albumArt.isNullOrBlank() && mediaInfo?.albumArt?.startsWith("data:") == true) {
                val imageBitmap = remember(mediaInfo.albumArt) {
                    try {
                        val pureBase64 = mediaInfo.albumArt.substringAfter(',')
                        val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                        BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                    } catch (_: Exception) {
                        null
                    }
                }
                imageBitmap?.let {
                    Image(
                        bitmap = it.asImageBitmap(),
                        contentDescription = "Album Art",
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color(0xFF333333), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🎵", fontSize = 24.sp)
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Title and artist
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = mediaInfo?.title ?: "No Title",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )
                Text(
                    text = mediaInfo?.artist ?: "Unknown Artist",
                    color = Color.Gray,
                    maxLines = 1
                )
            }

            // Controls
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { onCommand("player_prev") }) {
                    Text("⏮", fontSize = 24.sp)
                }
                IconButton(onClick = { onCommand("player_toggle") }) {
                    Text(if (isPlaying) "⏸" else "▶", fontSize = 24.sp)
                }
                IconButton(onClick = { onCommand("player_next") }) {
                    Text("⏭", fontSize = 24.sp)
                }
            }
        }
    }
}
@Composable
fun NowPlayingCard(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit,
    musicCardStyle: MusicCardStyle = MusicCardStyle.MODERN
) {
    // Switch between different music card styles based on the selected theme
    when (musicCardStyle) {
        MusicCardStyle.MODERN -> NowPlayingCardModern(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.NEON -> NowPlayingCardNeon(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.MINIMAL -> NowPlayingCardMinimal(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.CLASSIC -> NowPlayingCardClassic(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.VINYL -> NowPlayingCardVinyl(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.GRADIENT -> NowPlayingCardGradient(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.NEUMORPHIC -> NowPlayingCardNeumorphic(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
        MusicCardStyle.RETRO -> NowPlayingCardRetro(mediaInfo, onCommand, dynamicColors, onColorsUpdate)
    }
}

@Composable
fun NowPlayingCardModern(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Animated scale for playing state
    val scale by animateFloatAsState(
        targetValue = if (isPlaying) 1f else 0.98f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "scale"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .scale(scale),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(24.dp)
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            // Blurred background with gradient overlay (glassmorphism)
            Box(modifier = Modifier.matchParentSize()) {
                if (!artworkData.isNullOrBlank()) {
                    if (artworkData.startsWith("data:")) {
                        val imageBitmap = remember(artworkData) {
                            try {
                                val pureBase64 = artworkData.substringAfter(',')
                                val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)?.asImageBitmap()
                            } catch (_: Exception) { null }
                        }
                        imageBitmap?.let {
                            Image(
                                bitmap = it,
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize().blur(40.dp)
                            )
                        }
                    }
                }
                // Glassmorphic overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            androidx.compose.ui.graphics.Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.7f),
                                    Color.Black.copy(alpha = 0.85f)
                                )
                            )
                        )
                )
            }

            // Content with modern layout
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Compact header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "NOW PLAYING",
                        style = MaterialTheme.typography.labelMedium,
                        color = dynamicColors.primary,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.5.sp
                    )
                    // Status indicator
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(
                                    if (isPlaying) Color(0xFF00FF88) else Color.Gray,
                                    CircleShape
                                )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isPlaying) "PLAYING" else "PAUSED",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isPlaying) Color(0xFF00FF88) else Color.Gray,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Album art - larger and centered
                if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                    val imageBitmap = remember(artworkData) {
                        try {
                            val pureBase64 = artworkData.substringAfter(',')
                            val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                            val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                            bitmap
                        } catch (_: Exception) { null }
                    }

                    LaunchedEffect(imageBitmap) {
                        imageBitmap?.let {
                            val colors = extractColorsFromBitmap(it)
                            onColorsUpdate(colors)
                        }
                    }

                    imageBitmap?.let {
                        Card(
                            modifier = Modifier.size(240.dp),
                            shape = RoundedCornerShape(20.dp),
                            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
                        ) {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .size(240.dp)
                            .background(Color(0xFF1E1E1E), RoundedCornerShape(20.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎵", fontSize = 80.sp)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Track info
                Text(
                    text = mediaInfo?.title ?: "No Track Playing",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    maxLines = 2
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = mediaInfo?.artist ?: "",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Progress bar
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Column(modifier = Modifier.fillMaxWidth()) {
                    LinearProgressIndicator(
                        { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = dynamicColors.primary,
                        trackColor = Color.White.copy(alpha = 0.2f)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = formatTime(mediaInfo?.position),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.6f)
                        )
                        Text(
                            text = formatTime(mediaInfo?.duration),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.6f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Modern control buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Previous
                    IconButton(
                        onClick = { onCommand("player_prev") },
                        modifier = Modifier
                            .size(48.dp)
                            .background(Color.White.copy(alpha = 0.1f), CircleShape)
                    ) {
                        Text("⏮", fontSize = 20.sp, color = Color.White)
                    }

                    // Play/Pause - larger
                    IconButton(
                        onClick = { onCommand("player_toggle") },
                        modifier = Modifier
                            .size(64.dp)
                            .background(dynamicColors.primary, CircleShape)
                    ) {
                        Text(
                            if (isPlaying) "⏸" else "▶",
                            fontSize = 28.sp,
                            color = Color.Black
                        )
                    }

                    // Next
                    IconButton(
                        onClick = { onCommand("player_next") },
                        modifier = Modifier
                            .size(48.dp)
                            .background(Color.White.copy(alpha = 0.1f), CircleShape)
                    ) {
                        Text("⏭", fontSize = 20.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardNeon(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Pulsing animation for neon glow
    val infiniteTransition = rememberInfiniteTransition(label = "neon_glow")
    val glowIntensity by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow"
    )

    // Neon colors - bright cyan and magenta
    val neonCyan = Color(0xFF00FFFF)
    val neonMagenta = Color(0xFFFF00FF)
    val neonColor = if (isPlaying) neonCyan else neonMagenta

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .border(
                width = 3.dp,
                brush = androidx.compose.ui.graphics.Brush.linearGradient(
                    colors = listOf(neonCyan, neonMagenta, neonCyan)
                ),
                shape = RoundedCornerShape(20.dp)
            ),
        colors = CardDefaults.cardColors(containerColor = Color.Black),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Neon header with retro style
            Text(
                text = "◢◤ NEON PLAYER ◥◣",
                fontSize = 20.sp,
                color = neonColor.copy(alpha = glowIntensity),
                fontWeight = FontWeight.Black,
                letterSpacing = 4.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(bottom = 16.dp),
                style = androidx.compose.ui.text.TextStyle(
                    shadow = androidx.compose.ui.graphics.Shadow(
                        color = neonColor.copy(alpha = glowIntensity * 0.9f),
                        offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                        blurRadius = 20f
                    )
                )
            )

            // Album art with neon border
            if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                val imageBitmap = remember(artworkData) {
                    try {
                        val pureBase64 = artworkData.substringAfter(',')
                        val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                        val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                        bitmap
                    } catch (_: Exception) { null }
                }

                LaunchedEffect(imageBitmap) {
                    imageBitmap?.let {
                        val colors = extractColorsFromBitmap(it)
                        onColorsUpdate(colors)
                    }
                }

                imageBitmap?.let {
                    Box(
                        modifier = Modifier
                            .size(220.dp)
                            .border(
                                width = 4.dp,
                                brush = androidx.compose.ui.graphics.Brush.linearGradient(
                                    colors = listOf(
                                        neonCyan.copy(alpha = glowIntensity),
                                        neonMagenta.copy(alpha = glowIntensity)
                                    )
                                ),
                                shape = RoundedCornerShape(16.dp)
                            )
                            .padding(4.dp)
                    ) {
                        Image(
                            bitmap = it.asImageBitmap(),
                            contentDescription = "Album Art",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(RoundedCornerShape(12.dp))
                        )
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(220.dp)
                        .border(4.dp, neonColor.copy(alpha = glowIntensity), RoundedCornerShape(16.dp))
                        .background(Color(0xFF0A0A0A), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🎵", fontSize = 80.sp)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Track title with neon glow
            Text(
                text = mediaInfo?.title?.uppercase() ?: "∿∿∿ NO SIGNAL ∿∿∿",
                fontSize = 24.sp,
                color = neonCyan.copy(alpha = 0.95f),
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 2.sp,
                maxLines = 2,
                style = androidx.compose.ui.text.TextStyle(
                    shadow = androidx.compose.ui.graphics.Shadow(
                        color = neonCyan.copy(alpha = glowIntensity * 0.9f),
                        offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                        blurRadius = 20f
                    )
                )
            )

            if (!mediaInfo?.artist.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "▸ ${mediaInfo?.artist?.uppercase()}",
                    fontSize = 16.sp,
                    color = neonMagenta.copy(alpha = 0.85f),
                    textAlign = TextAlign.Center,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.5.sp,
                    fontWeight = FontWeight.Bold,
                    style = androidx.compose.ui.text.TextStyle(
                        shadow = androidx.compose.ui.graphics.Shadow(
                            color = neonMagenta.copy(alpha = glowIntensity * 0.7f),
                            offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                            blurRadius = 15f
                        )
                    )
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Neon progress bar
            val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
            Column(modifier = Modifier.fillMaxWidth()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .background(Color(0xFF1A1A1A), RoundedCornerShape(4.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progress)
                            .fillMaxHeight()
                            .background(
                                brush = androidx.compose.ui.graphics.Brush.horizontalGradient(
                                    colors = listOf(neonCyan, neonMagenta)
                                ),
                                shape = RoundedCornerShape(4.dp)
                            )
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = formatTime(mediaInfo?.position),
                        fontSize = 13.sp,
                        color = neonCyan,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = neonCyan.copy(alpha = 0.6f),
                                offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                blurRadius = 8f
                            )
                        )
                    )
                    Text(
                        text = formatTime(mediaInfo?.duration),
                        fontSize = 13.sp,
                        color = neonMagenta,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = neonMagenta.copy(alpha = 0.6f),
                                offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                blurRadius = 8f
                            )
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Neon control buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Previous
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .border(2.dp, neonMagenta.copy(alpha = 0.7f), CircleShape)
                        .clickable { onCommand("player_prev") },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⏮",
                        fontSize = 22.sp,
                        color = neonMagenta,
                        fontWeight = FontWeight.Bold,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = neonMagenta.copy(alpha = 0.8f),
                                offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                blurRadius = 12f
                            )
                        )
                    )
                }

                // Play/Pause
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .border(3.dp, neonColor.copy(alpha = glowIntensity), CircleShape)
                        .background(neonColor.copy(alpha = 0.2f), CircleShape)
                        .clickable { onCommand("player_toggle") },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (isPlaying) "⏸" else "▶",
                        fontSize = 32.sp,
                        color = neonColor,
                        fontWeight = FontWeight.Black,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = neonColor.copy(alpha = glowIntensity),
                                offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                blurRadius = 16f
                            )
                        )
                    )
                }

                // Next
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .border(2.dp, neonCyan.copy(alpha = 0.7f), CircleShape)
                        .clickable { onCommand("player_next") },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⏭",
                        fontSize = 22.sp,
                        color = neonCyan,
                        fontWeight = FontWeight.Bold,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = neonCyan.copy(alpha = 0.8f),
                                offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                blurRadius = 12f
                            )
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardMinimal(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F0F0F)),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Compact album art
            if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                val imageBitmap = remember(artworkData) {
                    try {
                        val pureBase64 = artworkData.substringAfter(',')
                        val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                        val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                        bitmap
                    } catch (_: Exception) { null }
                }

                LaunchedEffect(imageBitmap) {
                    imageBitmap?.let {
                        val colors = extractColorsFromBitmap(it)
                        onColorsUpdate(colors)
                    }
                }

                imageBitmap?.let {
                    Image(
                        bitmap = it.asImageBitmap(),
                        contentDescription = "Album Art",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(Color(0xFF1A1A1A), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🎵", fontSize = 32.sp)
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Track info and controls
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = mediaInfo?.title ?: "No Track",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = mediaInfo?.artist ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.6f),
                        maxLines = 1
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Minimal progress bar
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(3.dp)
                        .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(1.5.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progress)
                            .fillMaxHeight()
                            .background(Color.White, RoundedCornerShape(1.5.dp))
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Time display
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = formatTime(mediaInfo?.position),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 10.sp
                    )
                    Text(
                        text = formatTime(mediaInfo?.duration),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Minimal controls - vertical layout
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Previous (small)
                IconButton(
                    onClick = { onCommand("player_prev") },
                    modifier = Modifier.size(32.dp)
                ) {
                    Text("⏮", fontSize = 14.sp, color = Color.White.copy(alpha = 0.7f))
                }

                // Play/Pause (large)
                IconButton(
                    onClick = { onCommand("player_toggle") },
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color.White, CircleShape)
                ) {
                    Text(
                        if (isPlaying) "⏸" else "▶",
                        fontSize = 20.sp,
                        color = Color.Black
                    )
                }

                // Next (small)
                IconButton(
                    onClick = { onCommand("player_next") },
                    modifier = Modifier.size(32.dp)
                ) {
                    Text("⏭", fontSize = 14.sp, color = Color.White.copy(alpha = 0.7f))
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardVinyl(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Spinning animation for vinyl record
    val infiniteTransition = rememberInfiniteTransition(label = "vinyl_spin")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = if (isPlaying) 360f else 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2C1810)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    androidx.compose.ui.graphics.Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF3D2515),
                            Color(0xFF2C1810)
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Vintage header
                Text(
                    text = "♫ NOW SPINNING ♫",
                    fontSize = 18.sp,
                    color = Color(0xFFD4AF37),
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    letterSpacing = 3.sp,
                    style = androidx.compose.ui.text.TextStyle(
                        shadow = androidx.compose.ui.graphics.Shadow(
                            color = Color(0xFFD4AF37).copy(alpha = 0.5f),
                            offset = androidx.compose.ui.geometry.Offset(2f, 2f),
                            blurRadius = 4f
                        )
                    )
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Vinyl record with rotation
                Box(
                    modifier = Modifier.size(240.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Outer vinyl record
                    Box(
                        modifier = Modifier
                            .size(240.dp)
                            .graphicsLayer(rotationZ = rotation)
                            .background(
                                androidx.compose.ui.graphics.Brush.radialGradient(
                                    colors = listOf(
                                        Color(0xFF1A1A1A),
                                        Color(0xFF0A0A0A),
                                        Color(0xFF1A1A1A)
                                    )
                                ),
                                CircleShape
                            )
                            .border(4.dp, Color(0xFF2A2A2A), CircleShape)
                    )

                    // Album art in center
                    if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                        val imageBitmap = remember(artworkData) {
                            try {
                                val pureBase64 = artworkData.substringAfter(',')
                                val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                            } catch (_: Exception) { null }
                        }

                        LaunchedEffect(imageBitmap) {
                            imageBitmap?.let {
                                val colors = extractColorsFromBitmap(it)
                                onColorsUpdate(colors)
                            }
                        }

                        imageBitmap?.let {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(160.dp)
                                    .clip(CircleShape)
                                    .border(3.dp, Color(0xFFD4AF37), CircleShape)
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .size(160.dp)
                                .background(Color(0xFF1A1A1A), CircleShape)
                                .border(3.dp, Color(0xFFD4AF37), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🎵", fontSize = 60.sp)
                        }
                    }

                    // Center dot
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(Color(0xFFD4AF37), CircleShape)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Track info with vintage styling
                Text(
                    text = mediaInfo?.title ?: "No Record Playing",
                    fontSize = 22.sp,
                    color = Color(0xFFE8D4B0),
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    textAlign = TextAlign.Center,
                    maxLines = 2
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "by ${mediaInfo?.artist}",
                        fontSize = 16.sp,
                        color = Color(0xFFD4AF37),
                        fontFamily = FontFamily.Serif,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Vintage progress bar
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .background(Color(0xFF1A1A1A), RoundedCornerShape(3.dp))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progress)
                                .fillMaxHeight()
                                .background(Color(0xFFD4AF37), RoundedCornerShape(3.dp))
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = formatTime(mediaInfo?.position),
                            fontSize = 12.sp,
                            color = Color(0xFFD4AF37),
                            fontFamily = FontFamily.Serif
                        )
                        Text(
                            text = formatTime(mediaInfo?.duration),
                            fontSize = 12.sp,
                            color = Color(0xFFD4AF37),
                            fontFamily = FontFamily.Serif
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Vintage control buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onCommand("player_prev") },
                        modifier = Modifier
                            .size(50.dp)
                            .background(Color(0xFFD4AF37).copy(alpha = 0.2f), CircleShape)
                            .border(2.dp, Color(0xFFD4AF37), CircleShape)
                    ) {
                        Text("⏮", fontSize = 20.sp, color = Color(0xFFD4AF37))
                    }

                    IconButton(
                        onClick = { onCommand("player_toggle") },
                        modifier = Modifier
                            .size(65.dp)
                            .background(Color(0xFFD4AF37), CircleShape)
                    ) {
                        Text(
                            if (isPlaying) "⏸" else "▶",
                            fontSize = 28.sp,
                            color = Color(0xFF2C1810)
                        )
                    }

                    IconButton(
                        onClick = { onCommand("player_next") },
                        modifier = Modifier
                            .size(50.dp)
                            .background(Color(0xFFD4AF37).copy(alpha = 0.2f), CircleShape)
                            .border(2.dp, Color(0xFFD4AF37), CircleShape)
                    ) {
                        Text("⏭", fontSize = 20.sp, color = Color(0xFFD4AF37))
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardGradient(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Animated gradient shift
    val infiniteTransition = rememberInfiniteTransition(label = "gradient_shift")
    val gradientOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "offset"
    )

    // Dynamic gradient colors
    val gradientColors = listOf(
        dynamicColors.primary,
        dynamicColors.primary.copy(alpha = 0.7f),
        Color(0xFF9C27B0),
        Color(0xFFE91E63),
        dynamicColors.primary
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(24.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    androidx.compose.ui.graphics.Brush.linearGradient(
                        colors = gradientColors,
                        start = androidx.compose.ui.geometry.Offset(
                            gradientOffset * 1000f,
                            gradientOffset * 1000f
                        ),
                        end = androidx.compose.ui.geometry.Offset(
                            (1 - gradientOffset) * 1000f,
                            (1 - gradientOffset) * 1000f
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Gradient header
                Text(
                    text = "✨ GRADIENT WAVE ✨",
                    fontSize = 16.sp,
                    color = Color.White,
                    fontWeight = FontWeight.ExtraBold,
                    fontFamily = FontFamily.SansSerif,
                    letterSpacing = 3.sp,
                    style = androidx.compose.ui.text.TextStyle(
                        shadow = androidx.compose.ui.graphics.Shadow(
                            color = Color.Black.copy(alpha = 0.7f),
                            offset = androidx.compose.ui.geometry.Offset(0f, 2f),
                            blurRadius = 8f
                        )
                    )
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Album art with gradient border
                if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                    val imageBitmap = remember(artworkData) {
                        try {
                            val pureBase64 = artworkData.substringAfter(',')
                            val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                        } catch (_: Exception) { null }
                    }

                    LaunchedEffect(imageBitmap) {
                        imageBitmap?.let {
                            val colors = extractColorsFromBitmap(it)
                            onColorsUpdate(colors)
                        }
                    }

                    imageBitmap?.let {
                        Box(
                            modifier = Modifier
                                .size(230.dp)
                                .background(
                                    androidx.compose.ui.graphics.Brush.linearGradient(
                                        colors = listOf(
                                            Color.White,
                                            Color(0xFFFF6B9D),
                                            Color(0xFFC239E8)
                                        )
                                    ),
                                    RoundedCornerShape(20.dp)
                                )
                                .padding(4.dp)
                        ) {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(RoundedCornerShape(16.dp))
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .size(230.dp)
                            .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(20.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎵", fontSize = 80.sp)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Track info with shadow
                Text(
                    text = mediaInfo?.title ?: "No Track",
                    fontSize = 26.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.SansSerif,
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                    style = androidx.compose.ui.text.TextStyle(
                        shadow = androidx.compose.ui.graphics.Shadow(
                            color = Color.Black.copy(alpha = 0.6f),
                            offset = androidx.compose.ui.geometry.Offset(0f, 3f),
                            blurRadius = 10f
                        )
                    )
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = mediaInfo?.artist ?: "",
                        fontSize = 18.sp,
                        color = Color.White.copy(alpha = 0.9f),
                        fontWeight = FontWeight.SemiBold,
                        fontFamily = FontFamily.SansSerif,
                        textAlign = TextAlign.Center,
                        style = androidx.compose.ui.text.TextStyle(
                            shadow = androidx.compose.ui.graphics.Shadow(
                                color = Color.Black.copy(alpha = 0.5f),
                                offset = androidx.compose.ui.geometry.Offset(0f, 2f),
                                blurRadius = 6f
                            )
                        )
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Progress bar
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .background(Color.White.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progress)
                                .fillMaxHeight()
                                .background(Color.White, RoundedCornerShape(4.dp))
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = formatTime(mediaInfo?.position),
                            fontSize = 13.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = formatTime(mediaInfo?.duration),
                            fontSize = 13.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Control buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onCommand("player_prev") },
                        modifier = Modifier
                            .size(54.dp)
                            .background(Color.White.copy(alpha = 0.25f), CircleShape)
                    ) {
                        Text("⏮", fontSize = 22.sp, color = Color.White)
                    }

                    IconButton(
                        onClick = { onCommand("player_toggle") },
                        modifier = Modifier
                            .size(70.dp)
                            .background(Color.White, CircleShape)
                    ) {
                        Text(
                            if (isPlaying) "⏸" else "▶",
                            fontSize = 32.sp,
                            color = dynamicColors.primary
                        )
                    }

                    IconButton(
                        onClick = { onCommand("player_next") },
                        modifier = Modifier
                            .size(54.dp)
                            .background(Color.White.copy(alpha = 0.25f), CircleShape)
                    ) {
                        Text("⏭", fontSize = 22.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardNeumorphic(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Dark neumorphic colors
    val bgColor = Color(0xFF1C1C1E)
    val shadowLight = Color(0xFF2C2C2E)
    val shadowDark = Color(0xFF0A0A0B)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(30.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(bgColor)
        ) {
            Column(
                modifier = Modifier
                    .padding(28.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Neumorphic header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .background(bgColor, RoundedCornerShape(25.dp))
                        .drawWithContent {
                            drawContent()
                            // Inner shadow effect (simulated)
                            drawRect(
                                brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                                    colors = listOf(
                                        shadowDark.copy(alpha = 0.15f),
                                        Color.Transparent
                                    )
                                ),
                                size = size.copy(height = size.height * 0.3f)
                            )
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "NOW PLAYING",
                        fontSize = 14.sp,
                        color = Color(0xFFB0B0B5),
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.SansSerif,
                        letterSpacing = 2.sp
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Neumorphic album art container
                Box(
                    modifier = Modifier
                        .size(220.dp)
                        .background(bgColor, RoundedCornerShape(110.dp))
                        .drawWithContent {
                            drawContent()
                            // Neumorphic shadow simulation
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                        val imageBitmap = remember(artworkData) {
                            try {
                                val pureBase64 = artworkData.substringAfter(',')
                                val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                            } catch (_: Exception) { null }
                        }

                        LaunchedEffect(imageBitmap) {
                            imageBitmap?.let {
                                val colors = extractColorsFromBitmap(it)
                                onColorsUpdate(colors)
                            }
                        }

                        imageBitmap?.let {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(200.dp)
                                    .clip(CircleShape)
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .size(200.dp)
                                .background(bgColor, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🎵", fontSize = 70.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Track info
                Text(
                    text = mediaInfo?.title ?: "No Track",
                    fontSize = 22.sp,
                    color = Color(0xFFE5E5EA),
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.SansSerif,
                    textAlign = TextAlign.Center,
                    maxLines = 2
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = mediaInfo?.artist ?: "",
                        fontSize = 16.sp,
                        color = Color(0xFFB0B0B5),
                        fontWeight = FontWeight.Medium,
                        fontFamily = FontFamily.SansSerif,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Neumorphic progress bar
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(10.dp)
                            .background(bgColor, RoundedCornerShape(5.dp))
                            .drawWithContent {
                                drawContent()
                                // Inner shadow
                                drawRect(
                                    brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                                        colors = listOf(
                                            shadowDark.copy(alpha = 0.2f),
                                            Color.Transparent
                                        )
                                    ),
                                    size = size.copy(height = size.height * 0.5f)
                                )
                            }
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progress)
                                .fillMaxHeight()
                                .background(
                                    androidx.compose.ui.graphics.Brush.horizontalGradient(
                                        colors = listOf(
                                            dynamicColors.primary,
                                            dynamicColors.primary.copy(alpha = 0.7f)
                                        )
                                    ),
                                    RoundedCornerShape(5.dp)
                                )
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = formatTime(mediaInfo?.position),
                            fontSize = 12.sp,
                            color = Color(0xFFB0B0B5),
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = formatTime(mediaInfo?.duration),
                            fontSize = 12.sp,
                            color = Color(0xFFB0B0B5),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Neumorphic control buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .background(bgColor, CircleShape)
                            .clickable { onCommand("player_prev") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("⏮", fontSize = 20.sp, color = Color(0xFFB0B0B5))
                    }

                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .background(
                                brush = androidx.compose.ui.graphics.Brush.radialGradient(
                                    colors = listOf(
                                        dynamicColors.primary,
                                        dynamicColors.primary.copy(alpha = 0.8f)
                                    )
                                ),
                                shape = CircleShape
                            )
                            .clickable { onCommand("player_toggle") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            if (isPlaying) "⏸" else "▶",
                            fontSize = 28.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .background(bgColor, CircleShape)
                            .clickable { onCommand("player_next") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("⏭", fontSize = 20.sp, color = Color(0xFFB0B0B5))
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardRetro(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val isPlaying = mediaInfo?.status == "Playing"
    val artworkData = mediaInfo?.albumArt

    // Animated scanline effect
    val infiniteTransition = rememberInfiniteTransition(label = "scanline")
    val scanlineOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "scanline_offset"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .border(4.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF001100)),
        shape = RoundedCornerShape(0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF001100))
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Retro header with pixelated feel
                Text(
                    text = ">>> RETRO PLAYER <<<",
                    fontSize = 18.sp,
                    color = Color(0xFF00FF00),
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 2.sp,
                    style = androidx.compose.ui.text.TextStyle(
                        shadow = androidx.compose.ui.graphics.Shadow(
                            color = Color(0xFF00FF00).copy(alpha = 0.7f),
                            offset = androidx.compose.ui.geometry.Offset(2f, 2f),
                            blurRadius = 0f
                        )
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Album art with retro border
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .border(3.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp))
                        .padding(3.dp)
                ) {
                    if (!artworkData.isNullOrBlank() && artworkData.startsWith("data:")) {
                        val imageBitmap = remember(artworkData) {
                            try {
                                val pureBase64 = artworkData.substringAfter(',')
                                val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                            } catch (_: Exception) { null }
                        }

                        LaunchedEffect(imageBitmap) {
                            imageBitmap?.let {
                                val colors = extractColorsFromBitmap(it)
                                onColorsUpdate(colors)
                            }
                        }

                        imageBitmap?.let {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .graphicsLayer(
                                        // Add slight pixelation effect
                                        scaleX = 0.98f,
                                        scaleY = 0.98f
                                    )
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0xFF002200)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("▓▓▓", fontSize = 60.sp, color = Color(0xFF00FF00))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Track info with retro style
                Text(
                    text = "> ${(mediaInfo?.title ?: "NO DATA").uppercase()}",
                    fontSize = 20.sp,
                    color = Color(0xFF00FF00),
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                    lineHeight = 24.sp
                )

                if (!mediaInfo?.artist.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "[ ${mediaInfo?.artist?.uppercase()} ]",
                        fontSize = 14.sp,
                        color = Color(0xFF00AA00),
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Retro progress bar with ASCII
                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(20.dp)
                            .border(2.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp))
                            .background(Color(0xFF001100))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progress)
                                .fillMaxHeight()
                                .background(Color(0xFF00FF00))
                        )

                        // Progress percentage
                        Text(
                            text = "${(progress * 100).toInt()}%",
                            fontSize = 12.sp,
                            color = if (progress > 0.3f) Color.Black else Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "[${formatTime(mediaInfo?.position)}]",
                            fontSize = 12.sp,
                            color = Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "[${formatTime(mediaInfo?.duration)}]",
                            fontSize = 12.sp,
                            color = Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Retro control buttons with ASCII
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .width(60.dp)
                            .height(40.dp)
                            .border(2.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp))
                            .background(Color(0xFF002200))
                            .clickable { onCommand("player_prev") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "<<",
                            fontSize = 18.sp,
                            color = Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .border(3.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp))
                            .background(if (isPlaying) Color(0xFF00FF00) else Color(0xFF002200))
                            .clickable { onCommand("player_toggle") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (isPlaying) "||" else ">>",
                            fontSize = 22.sp,
                            color = if (isPlaying) Color.Black else Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Box(
                        modifier = Modifier
                            .width(60.dp)
                            .height(40.dp)
                            .border(2.dp, Color(0xFF00FF00), RoundedCornerShape(0.dp))
                            .background(Color(0xFF002200))
                            .clickable { onCommand("player_next") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = ">>",
                            fontSize = 18.sp,
                            color = Color(0xFF00FF00),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlayingCardClassic(
    mediaInfo: MediaInfo?,
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onColorsUpdate: (DynamicColors) -> Unit
) {
    val scale by animateFloatAsState(
        targetValue = if (mediaInfo != null) 1f else 0.95f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "scale"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .scale(scale),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A1A)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            // Blurred background artwork with crossfade
            val artworkData = mediaInfo?.albumArt
            val isPlaying = mediaInfo?.status == "Playing"

            // Debug logging
            // Animated blur value based on playing state
            val blurAmount by animateDpAsState(
                targetValue = if (isPlaying) 30.dp else 50.dp,
                animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
                label = "blur_animation"
            )

            // Animated overlay alpha based on playing state
            val overlayAlpha by animateFloatAsState(
                targetValue = if (isPlaying) 0.5f else 0.7f,
                animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
                label = "overlay_animation"
            )

            // Background layer with blur
            Box(modifier = Modifier.matchParentSize()) {
                AnimatedContent(
                    targetState = artworkData,
                    transitionSpec = {
                        fadeIn(animationSpec = tween(600)) togetherWith
                                fadeOut(animationSpec = tween(600))
                    },
                    label = "background_transition"
                ) { currentArtwork ->
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (!currentArtwork.isNullOrBlank()) {
                            if (currentArtwork.startsWith("data:")) {
                                val imageBitmap = remember(currentArtwork) {
                                    try {
                                        val pureBase64 = currentArtwork.substringAfter(',')
                                        val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                        BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)?.asImageBitmap()
                                    } catch (_: Exception) {
                                        null
                                    }
                                }

                                imageBitmap?.let {
                                    Image(
                                        bitmap = it,
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .blur(blurAmount)
                                    )
                                }
                            } else {
                                AsyncImage(
                                    model = currentArtwork,
                                    contentDescription = null,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .blur(blurAmount)
                                )
                            }
                        }

                        // Dark overlay always on top of blur with animated alpha
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = overlayAlpha))
                        )
                    }
                }
            }

            // Content on top
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                val textColor = dynamicColors.text
                val accentColor = getOppositeColor(dynamicColors.primary)

                Text(
                    text = "🎵 NOW PLAYING",
                    style = MaterialTheme.typography.titleMedium,
                    color = accentColor,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Album artwork with animated crossfade and scale
                AnimatedContent(
                    targetState = artworkData,
                    transitionSpec = {
                        (fadeIn(animationSpec = tween(500)) +
                                scaleIn(
                                    initialScale = 0.85f,
                                    animationSpec = tween(500, easing = FastOutSlowInEasing)
                                )).togetherWith(
                            fadeOut(animationSpec = tween(300)) +
                                    scaleOut(
                                        targetScale = 0.95f,
                                        animationSpec = tween(300)
                                    )
                        )
                    },
                    label = "artwork_transition"
                ) { currentArtwork ->
                    var imageSize by remember(currentArtwork) { mutableStateOf(DpSize(200.dp, 200.dp)) }
                    Card(
                        modifier = Modifier
                            .size(imageSize.width + 8.dp, imageSize.height + 8.dp)
                            .padding(4.dp),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(
                            defaultElevation = 12.dp,
                            pressedElevation = 16.dp
                        ),
                        colors = CardDefaults.cardColors(containerColor = Color.Black),
                        border = androidx.compose.foundation.BorderStroke(3.dp, accentColor)
                    ) {
                        Box(modifier = Modifier.fillMaxSize()) {
                        if (currentArtwork.isNullOrBlank()) {
                            Text("🖼", fontSize = 80.sp, textAlign = TextAlign.Center, modifier = Modifier.align(Alignment.Center))
                        } else if (currentArtwork.startsWith("data:")) {
                            val imageBitmap = remember(currentArtwork) {
                                try {
                                    val pureBase64 = currentArtwork.substringAfter(',')
                                    val decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT)
                                    BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                                } catch (_: Exception) {
                                    null
                                }
                            }

                            LaunchedEffect(imageBitmap) {
                                if (imageBitmap != null) {
                                    val colors = extractColorsFromBitmap(imageBitmap)
                                    onColorsUpdate(colors)
                                    val ratio = imageBitmap.width.toFloat() / imageBitmap.height
                                    val maxSize = 200.dp
                                    imageSize = if (ratio > 1) {
                                        DpSize(maxSize, maxSize / ratio)
                                    } else {
                                        DpSize(maxSize * ratio, maxSize)
                                    }
                                }
                            }

                            if (imageBitmap != null) {
                                Image(
                                    bitmap = imageBitmap.asImageBitmap(),
                                    contentDescription = "Album Art",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Text("⚠️", fontSize = 80.sp, textAlign = TextAlign.Center, modifier = Modifier.align(Alignment.Center))
                            }
                        } else {
                            var painter by remember(currentArtwork) { mutableStateOf<Any?>(null) }

                            AsyncImage(
                                model = currentArtwork,
                                contentDescription = "Album Art",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.fillMaxSize(),
                                onSuccess = { state ->
                                    painter = state.result
                                    val drawable = state.result.drawable

                                    val width = drawable.intrinsicWidth
                                    val height = drawable.intrinsicHeight
                                    if (width > 0 && height > 0) {
                                        val ratio = width.toFloat() / height
                                        val maxSize = 200.dp
                                        imageSize = if (ratio > 1) {
                                            DpSize(maxSize, maxSize / ratio)
                                        } else {
                                            DpSize(maxSize * ratio, maxSize)
                                        }
                                    }
                                }
                            )

                            LaunchedEffect(painter) {
                                painter?.let { result ->
                                    val drawable = (result as? coil.compose.AsyncImagePainter.State.Success)?.result?.drawable
                                    drawable?.let { d ->
                                        val bitmap = when (d) {
                                            is android.graphics.drawable.BitmapDrawable -> d.bitmap
                                            else -> {
                                                try {
                                                    val width = d.intrinsicWidth.takeIf { it > 0 } ?: 100
                                                    val height = d.intrinsicHeight.takeIf { it > 0 } ?: 100
                                                    val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                                                    val canvas = android.graphics.Canvas(bmp)
                                                    d.setBounds(0, 0, canvas.width, canvas.height)
                                                    d.draw(canvas)
                                                    bmp
                                                } catch (_: Exception) {
                                                    null
                                                }
                                            }
                                        }

                                        bitmap?.let {
                                            val colors = extractColorsFromBitmap(it)
                                            onColorsUpdate(colors)
                                        }
                                    }
                                }
                            }
                        }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Animated text transitions
                AnimatedContent(
                    targetState = mediaInfo?.title,
                    transitionSpec = {
                        fadeIn(animationSpec = tween(400)) togetherWith
                                fadeOut(animationSpec = tween(200))
                    },
                    label = "title_transition"
                ) { title ->
                    Text(
                        text = title ?: "No Track",
                        style = MaterialTheme.typography.titleLarge,
                        color = textColor,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                }

                if (mediaInfo != null && !mediaInfo.artist.isNullOrBlank()) {
                    AnimatedContent(
                        targetState = mediaInfo.artist,
                        transitionSpec = {
                            fadeIn(animationSpec = tween(400, delayMillis = 100)) togetherWith
                                    fadeOut(animationSpec = tween(200))
                        },
                        label = "artist_transition"
                    ) { artist ->
                        Text(
                            text = artist,
                            style = MaterialTheme.typography.bodyMedium,
                            color = textColor.copy(alpha = 0.9f),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                val progress = (mediaInfo?.position?.toFloat() ?: 0f) / (mediaInfo?.duration?.toFloat() ?: 1f)
                LinearProgressIndicator(
                    { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(4.dp)),
                    color = accentColor,
                    trackColor = textColor.copy(alpha = 0.3f)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = formatTime(mediaInfo?.position), color = textColor.copy(alpha = 0.8f), fontSize = 12.sp)
                    Text(text = formatTime(mediaInfo?.duration), color = textColor.copy(alpha = 0.8f), fontSize = 12.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { onCommand("player_prev") }) {
                        Text("⏮", fontSize = 28.sp, color = textColor)
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    IconButton(
                        onClick = { onCommand("player_toggle") },
                        modifier = Modifier
                            .size(56.dp)
                            .background(accentColor, CircleShape)
                    ) {
                        AnimatedContent(
                            targetState = mediaInfo?.status == "Playing",
                            transitionSpec = {
                                fadeIn(tween(200)) + scaleIn(tween(200)) togetherWith
                                        fadeOut(tween(200)) + scaleOut(tween(200))
                            },
                            label = "play_pause_icon"
                        ) { isPlaying ->
                            Text(
                                if (isPlaying) "⏸" else "▶",
                                fontSize = 28.sp,
                                color = getContrastingColor(accentColor)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    IconButton(onClick = { onCommand("player_next") }) {
                        Text("⏭", fontSize = 28.sp, color = textColor)
                    }
                }
            }
        }
    }
}

@Composable
fun BluetoothDevicesCard(
    devices: List<BluetoothDevice>,
    dynamicColors: DynamicColors
) {
    if (devices.isNotEmpty()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            colors = CardDefaults.cardColors(containerColor = dynamicColors.surface),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "📱 Bluetooth Devices",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = dynamicColors.text
                )
                Spacer(modifier = Modifier.height(16.dp))

                devices.forEachIndexed { index, device ->
                    Surface(
                        color = dynamicColors.surface.copy(alpha = 0.5f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = device.name ?: "Unnamed Device",
                                    fontWeight = FontWeight.Bold,
                                    color = dynamicColors.text,
                                    fontSize = 16.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = device.macAddress ?: "No Address",
                                    fontSize = 12.sp,
                                    color = dynamicColors.text.copy(alpha = 0.6f)
                                )
                            }

                            device.battery?.let {
                                Surface(
                                    color = dynamicColors.primary,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = "$it%",
                                        color = getContrastingColor(dynamicColors.primary),
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }
                    }

                    if (index < devices.size - 1) {
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun QuickActionsCard(
    onCommand: (String) -> Unit,
    dynamicColors: DynamicColors,
    onThemeChange: ((MusicCardStyle) -> Unit)? = null
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "⚡ Quick Actions",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(16.dp))
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "volume_up" to "🔊",
                    "volume_down" to "🔉",
                    "mute" to "🔇",
                    "brightness_up" to "🔆",
                    "brightness_down" to "🔅",
                    "toggle_bluetooth" to "🔄️",
                    "upload_file" to "📤"
                ).forEach { (command, icon) ->
                    Button(
                        onClick = { onCommand(command) },
                        modifier = Modifier
                            .size(64.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = dynamicColors.surface
                        ),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text(text = icon, fontSize = 24.sp)
                    }
                }
            }

            // Music Card Theme Buttons
            if (onThemeChange != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "🎨 Music Card Theme",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(12.dp))
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        MusicCardStyle.MODERN to "🎵 Modern",
                        MusicCardStyle.NEON to "💡 Neon",
                        MusicCardStyle.MINIMAL to "📱 Minimal",
                        MusicCardStyle.CLASSIC to "🎼 Classic",
                        MusicCardStyle.VINYL to "💿 Vinyl",
                        MusicCardStyle.GRADIENT to "🌈 Gradient",
                        MusicCardStyle.NEUMORPHIC to "◉ Neumorphic",
                        MusicCardStyle.RETRO to "👾 Retro"
                    ).forEach { (style, label) ->
                        Button(
                            onClick = { onThemeChange(style) },
                            modifier = Modifier.height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = dynamicColors.primary.copy(alpha = 0.8f)
                            ),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SystemOutputCard(
    output: String?,
    dynamicColors: DynamicColors
) {
    if (!output.isNullOrEmpty()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            colors = CardDefaults.cardColors(containerColor = dynamicColors.surface),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "💻 System Output",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = dynamicColors.text
                )
                Spacer(modifier = Modifier.height(16.dp))

                Surface(
                    color = Color.Black,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = output,
                        color = Color(0xFF00FF00),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    )
                }
            }
        }
    }
}

fun formatTime(microseconds: Double?): String {
    if (microseconds == null || microseconds <= 0) return "0:00"
    val seconds = (microseconds / 1_000_000).toInt()
    val hours = seconds / 3600
    val mins = (seconds % 3600) / 60
    val secs = seconds % 60
    return if (hours > 0) {
        "%d:%02d:%02d".format(hours, mins, secs)
    } else {
        "%d:%02d".format(mins, secs)
    }
}

@Composable
fun SettingsButton(onClick: () -> Unit, dynamicColors: DynamicColors = DynamicColors()) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = dynamicColors.surface),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onClick() }
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "⚙️ Settings",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = dynamicColors.text,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "→",
                fontSize = 24.sp,
                color = dynamicColors.primary
            )
        }
    }
}

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    onConnect: (String, String, String) -> Unit,
    onBackClick: () -> Unit
) {
    val connectionStatus by viewModel.connectionStatus
    val dynamicColors = remember { mutableStateOf(DynamicColors()) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Header with back button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(dynamicColors.value.background)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Text(
                    text = "←",
                    fontSize = 32.sp,
                    color = dynamicColors.value.primary
                )
            }
            Text(
                text = "⚙️ Settings",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = dynamicColors.value.primary,
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        // Connection Card
        ConnectionCard(isConnected = connectionStatus, onConnect = onConnect, dynamicColors = dynamicColors.value)
    }
}

// System Controls Card - Volume & Brightness Controls
@Composable
fun SystemControlsCard(
    volumeLevel: Int,
    isMuted: Boolean,
    brightnessLevel: Int,
    onVolumeUp: () -> Unit,
    onVolumeDown: () -> Unit,
    onToggleMute: () -> Unit,
    onBrightnessUp: () -> Unit,
    onBrightnessDown: () -> Unit,
    dynamicColors: DynamicColors
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "🎚️ System Controls",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Volume Control
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Volume",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (isMuted) "Muted" else "$volumeLevel%",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (isMuted) Color(0xFFFF6B6B) else dynamicColors.primary
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onVolumeDown,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = dynamicColors.surface
                    )
                ) {
                    Text("🔉 Down", fontSize = 14.sp)
                }
                LinearProgressIndicator(
                    progress = volumeLevel / 100f,
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp),
                    color = dynamicColors.primary,
                    trackColor = Color(0xFF333333)
                )
                Button(
                    onClick = onVolumeUp,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = dynamicColors.surface
                    )
                ) {
                    Text("🔊 Up", fontSize = 14.sp)
                }
            }

            Button(
                onClick = onToggleMute,
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .height(48.dp)
                    .padding(top = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isMuted) Color(0xFFFF6B6B) else dynamicColors.primary
                )
            ) {
                Text(
                    text = if (isMuted) "🔇 Unmute" else "🔇 Mute",
                    fontSize = 14.sp,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
            Divider(color = Color(0xFF333333), thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // Brightness Control
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Brightness",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "$brightnessLevel%",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFFFD700)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onBrightnessDown,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = dynamicColors.surface
                    )
                ) {
                    Text("🔅 Down", fontSize = 14.sp)
                }
                LinearProgressIndicator(
                    progress = brightnessLevel / 100f,
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp),
                    color = Color(0xFFFFD700),
                    trackColor = Color(0xFF333333)
                )
                Button(
                    onClick = onBrightnessUp,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = dynamicColors.surface
                    )
                ) {
                    Text("🔆 Up", fontSize = 14.sp)
                }
            }
        }
    }
}

