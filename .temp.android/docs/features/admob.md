# AdMob Integration

The Quazaar app is integrated with Google AdMob for monetization. This guide provides an overview of the AdMob implementation and troubleshooting steps.

## 🛠️ Configuration

*   **App ID:** `ca-app-pub-1775178587078079~2627652046`
*   **Ad Unit ID:** `ca-app-pub-1775178587078079/4230601657`

The AdMob SDK is initialized in the `BlitzApplication` class. The ad views are implemented as composables in `AdComposables.kt`.

## 📺 Available Ad Composables

*   **`BannerAdView`**: Standard 320x50 banner.
*   **`LargeBannerAdView`**: Large 320x100 banner.
*   **`AdaptiveBannerAdView`**: Responsive banner that adapts to the screen size.

## 🚀 How to Use

To display a banner ad, simply add one of the ad composables to your screen.

```kotlin
Column {
    YourContent()

    // Add banner at bottom
    BannerAdView(
        modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.BottomCenter)
    )
}
```

## 🚨 Troubleshooting

### AdMob Account Approval

**Error:** `❌ Ad failed to load: 3 - Account not approved yet.`

This error means that your AdMob account has not been approved yet. To fix this, you need to complete the verification process in the AdMob console. This may include adding payment information, verifying your identity, and providing tax information.

### Common AdMob Error Codes

| Code | Meaning | Solution |
|---|---|---|
| **0** | Success | Ad loaded! 🎉 |
| **1** | INVALID_REQUEST | Check your Ad Unit ID |
| **2** | NETWORK_ERROR | Check internet connection |
| **3** | NO_FILL | No ads available (wait or use test ads) |
| **8** | INTERNAL_ERROR | AdMob SDK issue (restart app) |

### Testing

Test ads are enabled by default during development. The test device ID is configured in `BlitzApplication.kt`. To switch to real ads for production, you need to set `USE_TEST_ADS` to `false` in `AdComposables.kt`.
