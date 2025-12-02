package com.quazaar.remote

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quazaar.remote.ui.*
import com.quazaar.remote.ui.theme.QuazaarTheme
import kotlinx.coroutines.delay

/**
 * Example Activity demonstrating all the new splash and connecting screens
 *
 * Usage Guide:
 *
 * 1. SplashTypingScreen - Shows typing animation of app name
 *    Use as initial splash screen on app launch
 *
 * 2. ConnectingFullScreen - Full screen circular progress
 *    Use when initially connecting to server
 *
 * 3. ConnectingCard - Card-based progress indicator
 *    Use for WebSocket connection status
 *
 * 4. ConnectingBouncingDots - Animated bouncing dots
 *    Use for establishing connection state
 *
 * 5. ConnectingLinearProgress - Linear progress bar
 *    Use for determinate loading operations
 *
 * 6. ConnectingInline - Small inline loader
 *    Use within other screens for loading states
 */
class SplashExampleActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                SplashSequenceDemo()
            }
        }
    }

    @Composable
    fun SplashSequenceDemo() {
        var currentScreen by remember { mutableStateOf(0) }

        // Sequence through all screens
        LaunchedEffect(currentScreen) {
            if (currentScreen in 1..4) {
                delay(3000) // Show each connecting screen for 3 seconds
                currentScreen++
            }
            if (currentScreen >= 5) {
                // Navigate to main activity
                startActivity(Intent(this@SplashExampleActivity, MainActivity::class.java))
                finish()
            }
        }

        when (currentScreen) {
            0 -> {
                // Splash typing screen
                SplashTypingScreen(
                    projectName = "BlitzApp",
                    typingDelayMs = 100,
                    pauseAfterTypingMs = 500,
                    onFinished = { currentScreen = 1 }
                )
            }
            1 -> {
                // Connecting screen 1
                ConnectingFullScreen(message = "Connecting to server")
            }
            2 -> {
                // Connecting screen 2
                ConnectingCard(message = "Establishing WebSocket")
            }
            3 -> {
                // Connecting screen 3
                ConnectingBouncingDots(message = "Syncing data")
            }
            4 -> {
                // Connecting screen 4
                ConnectingLinearProgress(message = "Loading resources")
            }
        }
    }
}

/**
 * Example of using connecting screens in real scenarios
 */
@Composable
fun ConnectionStatusExample() {
    var isConnecting by remember { mutableStateOf(true) }
    var connectionType by remember { mutableStateOf("server") }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (isConnecting) {
            when (connectionType) {
                "server" -> ConnectingFullScreen("Connecting to server")
                "websocket" -> ConnectingCard("Connecting to WebSocket")
                "sync" -> ConnectingBouncingDots("Syncing data")
                "resources" -> ConnectingLinearProgress("Loading resources")
            }
        } else {
            Text("Connected!")
        }

        // Demo controls (remove in production)
        Spacer(modifier = Modifier.height(32.dp))
        Button(onClick = { isConnecting = !isConnecting }) {
            Text(if (isConnecting) "Stop" else "Start")
        }
    }
}

