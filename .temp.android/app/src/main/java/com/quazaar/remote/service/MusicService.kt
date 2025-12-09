package com.quazaar.remote.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.quazaar.remote.MainActivity
import com.quazaar.remote.MainViewModel
import com.quazaar.remote.R
import com.quazaar.remote.WebSocketManager

class MusicService : Service() {
    private var webSocketManager: WebSocketManager? = null
    private var viewModel: MainViewModel? = null

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "music_service_channel"
        private const val CHANNEL_NAME = "Music Widget Service"

        var instance: MusicService? = null

        fun start(context: Context) {
            val intent = Intent(context, MusicService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, MusicService::class.java)
            context.stopService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d("MusicService", "Service created")
        instance = this

        // Create ViewModel and WebSocketManager for background updates
        viewModel = MainViewModel()
        webSocketManager = WebSocketManager(viewModel!!, this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("MusicService", "Service started")

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps music widget updated"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }

        // Start foreground with notification
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // API 29+ requires specifying the service type
            startForeground(
                NOTIFICATION_ID,
                createNotification(),
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(NOTIFICATION_ID, createNotification())
        }

        // Connect WebSocket with saved settings
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        val ip = prefs.getString("ip", "192.168.1.110") ?: "192.168.1.110"
        val port = prefs.getString("port", "8765") ?: "8765"
        val path = prefs.getString("path", "/ws?deviceId=\$2a\$10\$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2") ?: "/ws?deviceId=\$2a\$10\$jWT5DfCYez7vSyrR2NiBg.REJDNvP5dxy8Pr0uyuJXqGgg3XHpqv2"
        val url = "ws://$ip:$port$path"
        webSocketManager?.connect(url)
        Log.d("MusicService", "WebSocket connecting to $url")

        return START_STICKY  // Service will be restarted if killed
    }

    fun sendCommand(command: String) {
        webSocketManager?.sendCommand(command)
    }

    private fun createNotification(): Notification {
        // Intent to open MainActivity
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Quazaar Music Widget")
            .setContentText("Keeping widget updated")
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("MusicService", "Service destroyed")
        webSocketManager?.close()
        instance = null
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null  // We don't bind to this service
    }
}

