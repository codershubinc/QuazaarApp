package com.quazaar.remote.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color

@Composable
fun FileShareButton(onCommand: (String) -> Unit, dynamicColors: DynamicColors) {
    IconButton(onClick = { onCommand("upload_file") }) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Share,
                contentDescription = "File Share",
                tint = dynamicColors.primary
            )
            Text(text = "File Share", color = Color.White)
        }
    }
}

