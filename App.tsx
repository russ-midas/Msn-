import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { Navigation } from './src/navigation';
import { useAuthStore } from './src/stores/authStore';
import { usePresenceManager } from './src/services/presenceService';

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Manage presence based on app state (foreground/background)
  // Online = app open, Away = backgrounded, Offline = away >10min
  usePresenceManager();

  return (
    <>
      <StatusBar style="light" />
      <Navigation isAuthenticated={isAuthenticated} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
