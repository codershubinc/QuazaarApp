import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { useState, useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { theme } from './src/constants/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function configureFullScreen() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } catch (e) {
          console.log("NavigationBar error:", e);
        }
      }
    }
    configureFullScreen();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <MainScreen />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
