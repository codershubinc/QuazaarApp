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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.quazaar.remote.ui.theme.QuazaarTheme
import kotlinx.coroutines.delay

class SplashActivity3 : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuazaarTheme {
                MinimalistSplashScreen {
                    // Navigate to MainActivity after animation completes
                    startActivity(Intent(this@SplashActivity3, MainActivity::class.java))
                    finish()
                }
            }
        }
    }
}

@Composable
fun MinimalistSplashScreen(onAnimationComplete: () -> Unit) {
    val titleWidth = remember { Animatable(0f) }
    val subtitleOpacity = remember { Animatable(0f) }
    val bottomOpacity = remember { Animatable(0f) }
    val circleProgress = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        // Animate title width (left to right)
        titleWidth.animateTo(1f, animationSpec = tween(1200, easing = LinearEasing))

        // Show subtitle
        delay(200)
        subtitleOpacity.animateTo(1f, animationSpec = tween(800, easing = LinearEasing))

        // Animate progress circle
        delay(300)
        circleProgress.animateTo(1f, animationSpec = tween(1500, easing = LinearEasing))

        // Show bottom text
        delay(200)
        bottomOpacity.animateTo(1f, animationSpec = tween(800, easing = LinearEasing))

        // Wait and transition
        delay(1200)
        onAnimationComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            // Animated title with expanding underline
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "QUAZAAR",
                    fontSize = 64.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 4.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Expanding line under title
                Box(
                    modifier = Modifier
                        .width(280.dp * titleWidth.value)
                        .height(3.dp)
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    Color(0xFF6366f1),
                                    Color(0xFF8b5cf6)
                                )
                            ),
                            shape = RoundedCornerShape(1.5.dp)
                        )
                )
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Subtitle
            Text(
                text = "Remote Control Experience",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFa5b4fc),
                letterSpacing = 1.sp,
                modifier = Modifier.alpha(subtitleOpacity.value)
            )

            Spacer(modifier = Modifier.weight(1f))

            // Circular progress indicator
            CircularProgressIndicator(
                progress = circleProgress.value,
                modifier = Modifier.size(80.dp)
            )

            Spacer(modifier = Modifier.height(48.dp))

            // Bottom text
            Text(
                text = "Initializing...",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF64748b),
                modifier = Modifier.alpha(bottomOpacity.value)
            )

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}

@Composable
fun CircularProgressIndicator(
    progress: Float,
    modifier: Modifier = Modifier,
    strokeWidth: Float = 4f
) {
    Box(
        modifier = modifier
            .drawBehind {
                val diameter = size.minDimension
                val radius = diameter / 2
                val centerX = size.width / 2
                val centerY = size.height / 2

                // Background circle
                drawCircle(
                    color = Color(0xFF6366f1).copy(alpha = 0.1f),
                    radius = radius,
                    center = Offset(centerX, centerY),
                    style = Stroke(strokeWidth)
                )

                // Progress circle
                val sweepAngle = 360f * progress
                drawArc(
                    brush = Brush.sweepGradient(
                        center = Offset(centerX, centerY),
                        colors = listOf(
                            Color(0xFF6366f1),
                            Color(0xFF8b5cf6),
                            Color(0xFF6366f1)
                        )
                    ),
                    startAngle = -90f,
                    sweepAngle = sweepAngle,
                    useCenter = false,
                    style = Stroke(strokeWidth, cap = StrokeCap.Round)
                )
            }
    )
}

