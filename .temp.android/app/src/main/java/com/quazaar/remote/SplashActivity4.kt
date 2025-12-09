package com.quazaar.remote

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quazaar.remote.ui.theme.QuazaarTheme
import kotlinx.coroutines.delay

class SplashActivity4 : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                ServerConnectionSplashScreen {
                    // Start MainActivity and finish splash
                    val intent = Intent(this@SplashActivity4, MainActivity::class.java)
                    startActivity(intent)
                    finish()
                }
            }
        }
    }
}

@Composable
fun ServerConnectionSplashScreen(onAnimationComplete: () -> Unit) {
    val titleOpacity = remember { Animatable(0f) }
    val waveProgress = remember { Animatable(0f) }
    val statusOpacity = remember { Animatable(0f) }
    val pulseScale = remember { Animatable(1f) }
    var currentStatus by remember { mutableStateOf("Initializing...") }
    var animationFinished by remember { mutableStateOf(false) }

    val statuses = listOf(
        "Initializing...",
        "Connecting to server...",
        "Establishing WebSocket...",
        "Syncing data...",
        "Ready!"
    )

    // Fade in title
    LaunchedEffect(Unit) {
        titleOpacity.animateTo(1f, animationSpec = tween(600, easing = LinearEasing))
    }

    // Pulse animation loop
    LaunchedEffect(Unit) {
        while (true) {
            pulseScale.animateTo(1.3f, animationSpec = tween(800, easing = LinearEasing))
            pulseScale.animateTo(1f, animationSpec = tween(800, easing = LinearEasing))
        }
    }

    // Cycle through statuses and then transition
    LaunchedEffect(Unit) {
        try {
            repeat(statuses.size) { index ->
                currentStatus = statuses[index]
                statusOpacity.snapTo(0f)
                statusOpacity.animateTo(1f, animationSpec = tween(400, easing = LinearEasing))
                delay(800)
                statusOpacity.animateTo(0f, animationSpec = tween(400, easing = LinearEasing))
                delay(200)
            }

            waveProgress.animateTo(1f, animationSpec = tween(3000, easing = LinearEasing))
            delay(500)

            animationFinished = true
        } catch (e: Exception) {
            // Handle cancellation gracefully
            android.util.Log.e("SplashActivity4", "Animation interrupted", e)
        }
    }

    // Handle navigation only after animation is complete
    LaunchedEffect(animationFinished) {
        if (animationFinished) {
            delay(100) // Small delay to ensure UI is stable
            onAnimationComplete()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0a0e27),
                        Color(0xFF1a1f3a),
                        Color(0xFF0f172a)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Text(
                text = "QUAZAAR",
                fontSize = 56.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF6366f1),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 3.sp,
                modifier = Modifier.alpha(titleOpacity.value)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Remote Control",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFa5b4fc),
                letterSpacing = 1.5.sp,
                modifier = Modifier.alpha(titleOpacity.value)
            )

            Spacer(modifier = Modifier.height(64.dp))

            Box(
                modifier = Modifier
                    .size(120.dp)
                    .drawBehind {
                        val pulseAlpha = (1f - (pulseScale.value - 1f) * 2).coerceIn(0f, 1f)
                        drawCircle(
                            color = Color(0xFF6366f1).copy(alpha = 0.3f * pulseAlpha),
                            radius = (60 * pulseScale.value).dp.toPx(),
                            center = Offset(size.width / 2, size.height / 2)
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    Color(0xFF6366f1),
                                    Color(0xFF8b5cf6),
                                    Color(0xFF6366f1)
                                )
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⚡",
                        fontSize = 40.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            Box(
                modifier = Modifier
                    .height(30.dp)
                    .wrapContentSize(Alignment.Center)
            ) {
                Text(
                    text = currentStatus,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF6366f1),
                    modifier = Modifier.alpha(statusOpacity.value)
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            WaveLoadingIndicator(progress = waveProgress.value)

            Spacer(modifier = Modifier.height(48.dp))

            ConnectionStats()
        }
    }
}

@Composable
fun WaveLoadingIndicator(progress: Float) {
    Box(
        modifier = Modifier
            .width(200.dp)
            .height(60.dp)
            .drawBehind {
                val waveHeight = 8.dp.toPx()
                val waveLength = 30.dp.toPx()
                val yCenter = size.height / 2

                var x = 0f
                while (x < size.width) {
                    val waveOffset = (x + (progress * size.width)) % (waveLength * 2)
                    val y = yCenter + (kotlin.math.sin((waveOffset / waveLength) * Math.PI) * waveHeight).toFloat()

                    if (x < size.width * progress) {
                        drawCircle(
                            color = Color(0xFF6366f1),
                            radius = 2.dp.toPx(),
                            center = Offset(x, y)
                        )
                    }
                    x += 2f
                }

                drawLine(
                    color = Color(0xFF6366f1).copy(alpha = 0.2f),
                    start = Offset(0f, yCenter),
                    end = Offset(size.width, yCenter),
                    strokeWidth = 1.dp.toPx()
                )
            }
    )
}

@Composable
fun ConnectionStats() {
    val latency = remember { Animatable(0f) }
    val bandwidth = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        delay(800)
        latency.animateTo(100f, animationSpec = tween(1000, easing = LinearEasing))
        bandwidth.animateTo(95f, animationSpec = tween(1000, easing = LinearEasing))
    }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(200.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                color = Color(0xFF6366f1).copy(alpha = 0.1f),
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "${latency.value.toInt()}ms",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF6366f1)
                )
                Text(
                    text = "Latency",
                    fontSize = 10.sp,
                    color = Color(0xFFa5b4fc).copy(alpha = 0.7f)
                )
            }

            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(30.dp)
                    .background(Color(0xFF6366f1).copy(alpha = 0.2f))
            )

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "${bandwidth.value.toInt()}%",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF6366f1)
                )
                Text(
                    text = "Bandwidth",
                    fontSize = 10.sp,
                    color = Color(0xFFa5b4fc).copy(alpha = 0.7f)
                )
            }
        }
    }
}

