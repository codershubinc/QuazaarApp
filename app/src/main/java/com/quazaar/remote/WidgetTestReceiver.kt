package com.quazaar.remote

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.quazaar.remote.widget.MusicWidgetProvider

class WidgetTestReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("WidgetTestReceiver", "Test update triggered")
        
        // Send test data to widget
        MusicWidgetProvider.updateWidget(
            context = context,
            title = "Test Song",
            artist = "Test Artist",
            isPlaying = true,
            albumArt = null,
            position = 30_000_000L, // 30 seconds
            duration = 180_000_000L  // 3 minutes
        )
        
        Log.d("WidgetTestReceiver", "Test data sent to widget")
    }
}

