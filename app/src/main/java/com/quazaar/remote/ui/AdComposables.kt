package com.quazaar.remote.ui

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.LoadAdError
import androidx.compose.material3.MaterialTheme

// Set to true for testing, false for production
private const val USE_TEST_ADS = true

// Test Ad Unit ID provided by Google for testing
private const val TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111"

// Your real Ad Unit ID
private const val REAL_AD_UNIT_ID = "ca-app-pub-1775178587078079/4230601657"

// Choose which ad unit to use
private val AD_UNIT_ID = if (USE_TEST_ADS) TEST_AD_UNIT_ID else REAL_AD_UNIT_ID

/**
 * Banner Ad Composable for displaying Google AdMob banner ads
 * Unit ID: ca-app-pub-1775178587078079/4230601657
 *
 * Note: Currently using TEST ads. Set USE_TEST_ADS = false in production
 */
@Composable
fun BannerAdView(
    modifier: Modifier = Modifier
) {

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(300.dp)
            .background(MaterialTheme.colorScheme.surface)
    ) {
        AndroidView<AdView>(
            factory = { context ->
                AdView(context).apply {
                    try {
                        setAdSize(AdSize.BANNER)
                        adUnitId = AD_UNIT_ID

                        // Add listener for debugging
                        adListener = object : AdListener() {
                            override fun onAdLoaded() {
                                Log.d("BannerAd", "✅ Ad loaded successfully")
                            }

                            override fun onAdFailedToLoad(error: LoadAdError) {
                                Log.e("BannerAd", "❌ Ad failed to load: ${error.code} - ${error.message}")
                                Log.e("BannerAd", "Domain: ${error.domain}, Cause: ${error.cause}")
                                when (error.code) {
                                    0 -> Log.e("BannerAd", "ERROR_CODE_INTERNAL_ERROR")
                                    1 -> Log.e("BannerAd", "ERROR_CODE_INVALID_REQUEST")
                                    2 -> Log.e("BannerAd", "ERROR_CODE_NETWORK_ERROR")
                                    3 -> Log.e("BannerAd", "ERROR_CODE_NO_FILL")
                                }
                            }

                            override fun onAdOpened() {
                                Log.d("BannerAd", "Ad opened")
                            }

                            override fun onAdClicked() {
                                Log.d("BannerAd", "Ad clicked")
                            }

                            override fun onAdClosed() {
                                Log.d("BannerAd", "Ad closed")
                            }
                        }

                        Log.d("BannerAd", "Loading ad with Unit ID: $adUnitId")
                        loadAd(AdRequest.Builder().build())
                    } catch (e: Exception) {
                        Log.e("BannerAd", "Exception while loading ad: ${e.message}", e)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
        )
    }
}

/**
 * Large Banner Ad Composable (320x100)
 */
@Composable
fun LargeBannerAdView(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(MaterialTheme.colorScheme.surface)
    ) {
        AndroidView<AdView>(
            factory = { context ->
                AdView(context).apply {
                    try {
                        setAdSize(AdSize.LARGE_BANNER)
                        adUnitId = AD_UNIT_ID

                        adListener = object : AdListener() {
                            override fun onAdLoaded() {
                                Log.d("LargeBannerAd", "✅ Large banner ad loaded")
                            }

                            override fun onAdFailedToLoad(error: LoadAdError) {
                                Log.e("LargeBannerAd", "❌ Ad failed: ${error.code} - ${error.message}")
                            }
                        }

                        loadAd(AdRequest.Builder().build())
                    } catch (e: Exception) {
                        Log.e("LargeBannerAd", "Exception while loading ad: ${e.message}", e)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp)
        )
    }
}

/**
 * Full-width Adaptive Banner Ad Composable
 */
@Composable
fun AdaptiveBannerAdView(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .background(MaterialTheme.colorScheme.surface)
    ) {
        AndroidView<AdView>(
            factory = { context ->
                AdView(context).apply {
                    try {
                        setAdSize(AdSize.BANNER)
                        adUnitId = AD_UNIT_ID

                        adListener = object : AdListener() {
                            override fun onAdLoaded() {
                                Log.d("AdaptiveBannerAd", "✅ Adaptive banner ad loaded")
                            }

                            override fun onAdFailedToLoad(error: LoadAdError) {
                                Log.e("AdaptiveBannerAd", "❌ Ad failed: ${error.code} - ${error.message}")
                            }
                        }

                        loadAd(AdRequest.Builder().build())
                    } catch (e: Exception) {
                        Log.e("AdaptiveBannerAd", "Exception while loading ad: ${e.message}", e)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        )
    }
}
