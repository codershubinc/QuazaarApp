# How to Create a Music Info Widget for QuazaarApp (Android)

This guide outlines the steps to create a home screen widget that displays the current music information (Title, Artist) from the QuazaarApp.

## Overview

1.  **Native Android UI**: Create the layout XML for the widget.
2.  **Widget Provider**: Write the Java/Kotlin code to handle widget updates.
3.  **Manifest Registration**: Register the widget in `AndroidManifest.xml`.
4.  **Data Bridge**: Create a Native Module to send data from React Native to the Android Widget.

---

## Step 1: Create the Widget Layout

Create a file: `android/app/src/main/res/layout/widget_music_info.xml`

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#1a1f3a"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/widget_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="No Music Playing"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/widget_artist"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Quazaar"
        android:textColor="#AAAAAA"
        android:textSize="14sp" />
</LinearLayout>
```

## Step 2: Create Widget Metadata

Create a file: `android/app/src/main/res/xml/widget_music_info_info.xml`

```xml
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="70dp"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/widget_music_info"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen">
</appwidget-provider>
```

## Step 3: Create the Widget Provider (Java)

Create a file: `android/app/src/main/java/com/codershubinc/quazaar/MusicWidget.java`

```java
package com.codershubinc.quazaar;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONObject;

public class MusicWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);
            String jsonString = prefs.getString("media_info", "{}");
            JSONObject data = new JSONObject(jsonString);

            String title = data.optString("Title", "No Music");
            String artist = data.optString("Artist", "Quazaar");

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_music_info);
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_artist, artist);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## Step 4: Create a Native Module to Save Data

We need a way for React Native to write to the `SharedPreferences` that the Widget reads.

**1. Create `WidgetModule.java`** in `android/app/src/main/java/com/codershubinc/quazaar/`

```java
package com.codershubinc.quazaar;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WidgetModule extends ReactContextBaseJavaModule {
    ReactApplicationContext context;

    public WidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "WidgetModule";
    }

    @ReactMethod
    public void setMediaInfo(String jsonString) {
        try {
            // Save data to Shared Preferences
            SharedPreferences.Editor editor = context.getSharedPreferences("DATA", Context.MODE_PRIVATE).edit();
            editor.putString("media_info", jsonString);
            editor.apply();

            // Trigger Widget Update
            Intent intent = new Intent(context, MusicWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, MusicWidget.class));
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            context.sendBroadcast(intent);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**2. Register the Module in `MainApplication.kt` (or create a Package)**

If you don't have a separate Package class, you can add it to the `getPackages()` list in `MainApplication.kt` (or `.java`).

_Ideally, create `WidgetPackage.java`:_

```java
package com.codershubinc.quazaar;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WidgetPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new WidgetModule(reactContext));
        return modules;
    }
}
```

_Then add `new WidgetPackage()` to your `MainApplication`._

## Step 5: Update AndroidManifest.xml

Add the receiver inside the `<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<receiver android:name=".MusicWidget" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_music_info_info" />
</receiver>
```

## Step 6: Update React Native Code

Now, update your `WebSocketService.ts` to send data to the widget whenever it changes.

```typescript
import { NativeModules } from 'react-native';
const { WidgetModule } = NativeModules;

// ... inside parseMessage ...
case 'media_info':
    if (response.data) {
        const mediaInfo = response.data as MediaInfo;
        store.setMediaInfo(mediaInfo);

        // UPDATE WIDGET
        if (WidgetModule) {
            WidgetModule.setMediaInfo(JSON.stringify(mediaInfo));
        }
    }
    break;
```

## Step 7: Rebuild

Since you added native code and resources, you must rebuild:

```bash
npx expo run:android
```
