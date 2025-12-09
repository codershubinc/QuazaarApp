package com.quazaar.remote.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import kotlinx.coroutines.delay

/**
 * Splash Screen with typing animation effect
 * Shows project name being typed out character by character
 */
@Composable
fun SplashTypingScreen(
    projectName: String = "BlitzApp",
    typingDelayMs: Long = 80,
    pauseAfterTypingMs: Long = 700,
    onFinished: () -> Unit
) {
    var visibleChars by remember { mutableIntStateOf(0) }

    // Typing effect
    LaunchedEffect(projectName) {
        visibleChars = 0
        while (visibleChars < projectName.length) {
            delay(typingDelayMs)
            visibleChars++
        }
        delay(pauseAfterTypingMs)
        onFinished()
    }

    // Blinking cursor animation
    val infiniteTransition = rememberInfiniteTransition(label = "cursor")
    val cursorAlpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, easing = FastOutLinearInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursorAlpha"
    )

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        val displayedText = projectName.take(visibleChars)
        Text(
            text = "$displayedText█", // Block cursor character
            modifier = Modifier.alpha(cursorAlpha),
            style = MaterialTheme.typography.displayLarge,
            color = MaterialTheme.colorScheme.primary
        )
    }
}


