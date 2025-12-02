package com.quazaar.remote

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Custom Application class for BlitzApp
 * Initializes Google AdMob SDK on app startup
 */
class BlitzApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Mobile Ads SDK
        initializeAds()
    }

    private fun initializeAds() {
        // Initialize in background thread with timeout
        CoroutineScope(Dispatchers.IO).launch {
            try {
                android.util.Log.d("BlitzApp", "🚀 Starting AdMob SDK initialization...")

                // Configure test ads for development BEFORE initialization
                val requestConfiguration = RequestConfiguration.Builder()
                    .setTestDeviceIds(listOf(
                        "EF427FD62CA71670AD16EC282760EB33"
                    ))
                    .build()
                MobileAds.setRequestConfiguration(requestConfiguration)
                android.util.Log.d("BlitzApp", "✅ Test device configured")

                // Initialize the Mobile Ads SDK with timeout
                val initResult = withTimeoutOrNull(30000L) { // 30 second timeout
                    MobileAds.initialize(this@BlitzApplication) { initStatus ->
                        // Initialization complete
                        val statusMap = initStatus.adapterStatusMap
                        android.util.Log.d("BlitzApp", "📊 AdMob initialization status:")
                        for (adapterClass in statusMap.keys) {
                            val status = statusMap[adapterClass]
                            android.util.Log.d(
                                "BlitzApp",
                                "  - $adapterClass: ${status?.description} (Latency: ${status?.latency}ms)"
                            )
                        }
                    }
                }

                if (initResult != null) {
                    android.util.Log.d("BlitzApp", "✅ AdMob SDK initialized successfully")
                } else {
                    android.util.Log.w("BlitzApp", "⚠️ AdMob initialization timed out - ads may not work")
                }

            } catch (e: Exception) {
                android.util.Log.e("BlitzApp", "❌ Error initializing ads: ${e.message}", e)
                android.util.Log.w("BlitzApp", "⚠️ App will continue without ads")
            }
        }
    }
}

