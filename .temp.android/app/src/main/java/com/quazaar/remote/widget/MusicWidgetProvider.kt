package com.quazaar.remote.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import android.widget.RemoteViews
import com.quazaar.remote.MainActivity
import com.quazaar.remote.R

class MusicWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update all widget instances
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Widget is being used for the first time
        super.onEnabled(context)
    }

    override fun onDisabled(context: Context) {
        // Last widget instance removed
        super.onDisabled(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            ACTION_UPDATE_WIDGET -> {
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(
                    ComponentName(context, MusicWidgetProvider::class.java)
                )
                onUpdate(context, appWidgetManager, appWidgetIds)
            }
            ACTION_PLAY_PAUSE -> {
                Log.d("MusicWidgetProvider", "Play/Pause button clicked")
                // Send command directly through MusicService
                com.quazaar.remote.service.MusicService.instance?.sendCommand("player_toggle")
            }
            ACTION_NEXT -> {
                Log.d("MusicWidgetProvider", "Next button clicked")
                // Send command directly through MusicService
                com.quazaar.remote.service.MusicService.instance?.sendCommand("player_next")
            }
            ACTION_PREVIOUS -> {
                Log.d("MusicWidgetProvider", "Previous button clicked")
                // Send command directly through MusicService
                com.quazaar.remote.service.MusicService.instance?.sendCommand("player_prev")
            }
        }
    }

    companion object {
        const val ACTION_UPDATE_WIDGET = "com.quazaar.remote.ACTION_UPDATE_WIDGET"
        const val ACTION_PLAY_PAUSE = "com.quazaar.remote.ACTION_PLAY_PAUSE"
        const val ACTION_NEXT = "com.quazaar.remote.ACTION_NEXT"
        const val ACTION_PREVIOUS = "com.quazaar.remote.ACTION_PREVIOUS"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.music_widget_layout)

            // Load saved music info from SharedPreferences
            val prefs = context.getSharedPreferences("music_widget_prefs", Context.MODE_PRIVATE)
            val title = prefs.getString("title", "No Track Playing") ?: "No Track Playing"
            val artist = prefs.getString("artist", "Unknown Artist") ?: "Unknown Artist"
            val isPlaying = prefs.getBoolean("is_playing", false)
            val albumArtBase64 = prefs.getString("album_art", null)
            val position = prefs.getLong("position", 0L)
            val duration = prefs.getLong("duration", 0L)

            // Update UI
            views.setTextViewText(R.id.widget_title, title)
            views.setTextViewText(R.id.widget_artist, artist)

            // Format and set time
            views.setTextViewText(R.id.widget_current_time, formatTime(position))
            views.setTextViewText(R.id.widget_total_time, formatTime(duration))

            // Update progress bar
            if (duration > 0) {
                val progress = ((position.toFloat() / duration.toFloat()) * 100).toInt()
                views.setProgressBar(R.id.widget_progress, 100, progress, false)
            } else {
                views.setProgressBar(R.id.widget_progress, 100, 0, false)
            }

            // Set album art
            if (!albumArtBase64.isNullOrEmpty()) {
                try {
                    val imageBytes = Base64.decode(
                        albumArtBase64.substringAfter(','),
                        Base64.DEFAULT
                    )
                    val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                    if (bitmap != null) {
                        views.setImageViewBitmap(R.id.widget_album_art, bitmap)
                    } else {
                        views.setImageViewResource(R.id.widget_album_art, R.drawable.ic_music_note)
                    }
                } catch (e: Exception) {
                    views.setImageViewResource(R.id.widget_album_art, R.drawable.ic_music_note)
                }
            } else {
                views.setImageViewResource(R.id.widget_album_art, R.drawable.ic_music_note)
            }

            // Set play/pause icon
            if (isPlaying) {
                views.setImageViewResource(R.id.widget_play_pause, android.R.drawable.ic_media_pause)
            } else {
                views.setImageViewResource(R.id.widget_play_pause, android.R.drawable.ic_media_play)
            }

            // Setup click handlers
            setupClickHandlers(context, views)

            // Update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun formatTime(microseconds: Long): String {
            if (microseconds <= 0) return "0:00"
            val seconds = (microseconds / 1_000_000).toInt()
            val hours = seconds / 3600
            val mins = (seconds % 3600) / 60
            val secs = seconds % 60
            return if (hours > 0) {
                String.format(java.util.Locale.US, "%d:%02d:%02d", hours, mins, secs)
            } else {
                String.format(java.util.Locale.US, "%d:%02d", mins, secs)
            }
        }

        private fun setupClickHandlers(context: Context, views: RemoteViews) {
            // Open app on widget click
            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openAppPendingIntent = PendingIntent.getActivity(
                context, 0, openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, openAppPendingIntent)

            // Play/Pause button
            val playPauseIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_PLAY_PAUSE
            }
            val playPausePendingIntent = PendingIntent.getBroadcast(
                context, 1, playPauseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_play_pause, playPausePendingIntent)

            // Previous button
            val previousIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_PREVIOUS
            }
            val previousPendingIntent = PendingIntent.getBroadcast(
                context, 2, previousIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_previous, previousPendingIntent)

            // Next button
            val nextIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_NEXT
            }
            val nextPendingIntent = PendingIntent.getBroadcast(
                context, 3, nextIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_next, nextPendingIntent)
        }

        fun updateWidget(
            context: Context,
            title: String,
            artist: String,
            isPlaying: Boolean,
            albumArt: String?,
            position: Long = 0L,
            duration: Long = 0L
        ) {
            // Save to SharedPreferences
            val prefs = context.getSharedPreferences("music_widget_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("title", title)
                putString("artist", artist)
                putBoolean("is_playing", isPlaying)
                putString("album_art", albumArt)
                putLong("position", position)
                putLong("duration", duration)
                apply()
            }

            // Trigger widget update
            val intent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_UPDATE_WIDGET
            }
            context.sendBroadcast(intent)
        }
    }
}

