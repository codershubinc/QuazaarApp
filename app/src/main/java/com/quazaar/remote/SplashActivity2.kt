package com.quazaar.remote

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.EaseInOutQuad
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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quazaar.remote.ui.theme.QuazaarTheme
import kotlinx.coroutines.delay

class SplashActivity2 : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                AlternativeSplashScreen {
                    startActivity(Intent(this@SplashActivity2, MainActivity::class.java))
                    finish()
                }
            }
        }
    }
}

@Composable
fun AlternativeSplashScreen(onAnimationComplete: () -> Unit) {
    val logoRotation = remember { Animatable(0f) }
    val logoScale = remember { Animatable(0f) }
    val textOpacity = remember { Animatable(0f) }
    val bottomTextOpacity = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        logoRotation.animateTo(360f, animationSpec = tween(2000, easing = LinearEasing))
        logoScale.animateTo(1f, animationSpec = tween(1500, easing = EaseInOutQuad))

        textOpacity.animateTo(1f, animationSpec = tween(800, easing = LinearEasing))

        delay(300)
        bottomTextOpacity.animateTo(1f, animationSpec = tween(800, easing = LinearEasing))

        delay(1500)
        onAnimationComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0f172a),
                        Color(0xFF1e293b),
                        Color(0xFF0f172a)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        repeat(3) { index ->
            val circleRotation = remember { Animatable(0f) }
            val circleScale = remember { Animatable(0.5f) }

            LaunchedEffect(Unit) {
                circleRotation.animateTo(360f, animationSpec = tween(4000 + (index * 500), easing = LinearEasing))
            }

            LaunchedEffect(Unit) {
                while (true) {
                    circleScale.animateTo(1.2f, animationSpec = tween(1500, easing = LinearEasing))
                    circleScale.animateTo(0.8f, animationSpec = tween(1500, easing = LinearEasing))
                }
            }

            Box(
                modifier = Modifier
                    .size((200.dp * (1 + index.toFloat())))
                    .rotate(circleRotation.value)
                    .alpha(0.1f + (index * 0.05f))
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF6366f1),
                                Color(0xFF6366f1).copy(alpha = 0.3f),
                                Color.Transparent
                            )
                        ),
                        shape = CircleShape
                    )
            )
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .rotate(logoRotation.value)
                    .scale(logoScale.value)
                    .background(
                        brush = Brush.linearGradient(
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
                    fontSize = 48.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            Text(
                text = "QUAZAAR",
                fontSize = 52.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF6366f1),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 4.sp,
                modifier = Modifier.alpha(textOpacity.value)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Remote Control",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFa5b4fc),
                letterSpacing = 2.sp,
                modifier = Modifier.alpha(bottomTextOpacity.value)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .width(80.dp)
                    .height(2.dp)
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color(0xFF6366f1),
                                Color.Transparent
                            )
                        ),
                        shape = RoundedCornerShape(1.dp)
                    )
                    .alpha(bottomTextOpacity.value)
            )

            Spacer(modifier = Modifier.height(48.dp))

            AnimatedProgressBar2(alpha = textOpacity.value)
        }
    }
}

@Composable
fun AnimatedProgressBar2(alpha: Float) {
    val progress = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        while (true) {
            progress.animateTo(1f, animationSpec = tween(2000, easing = LinearEasing))
            progress.snapTo(0f)
        }
    }

    Box(
        modifier = Modifier
            .width(100.dp)
            .height(3.dp)
            .background(
                color = Color(0xFF6366f1).copy(alpha = 0.2f),
                shape = RoundedCornerShape(1.5.dp)
            )
            .alpha(alpha)
    ) {
        Box(
            modifier = Modifier
                .width(100.dp * progress.value)
                .fillMaxHeight()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color(0xFF6366f1),
                            Color.Transparent
                        )
                    ),
                    shape = RoundedCornerShape(1.5.dp)
                )
        )
    }
}


