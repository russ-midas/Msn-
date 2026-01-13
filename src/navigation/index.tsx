import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { colors } from '../theme';
import { useMessagesStore } from '../stores/messagesStore';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Main Screens
import { ContactsScreen } from '../screens/main/ContactsScreen';
import { ConversationsScreen } from '../screens/main/ConversationsScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { StatusScreen } from '../screens/main/StatusScreen';

// Types
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Chat: { conversationId: string; contactId?: string };
  Status: undefined;
  Settings: undefined;
};

export type MainTabsParamList = {
  Contacts: undefined;
  Conversations: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ui.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  const unreadCount = useMessagesStore((state) => state.getUnreadCount());

  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.msn.light,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Conversations') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTabs.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ tabBarLabel: 'Buddies' }}
      />
      <MainTabs.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Me' }}
      />
    </MainTabs.Navigator>
  );
}

// Main Navigator
function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ui.background },
      }}
    >
      <MainStack.Screen name="MainTabs" component={TabNavigator} />
      <MainStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <MainStack.Screen
        name="Status"
        component={StatusScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </MainStack.Navigator>
  );
}

// Root Navigation
interface NavigationProps {
  isAuthenticated: boolean;
}

export function Navigation({ isAuthenticated }: NavigationProps) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.ui.surface,
    borderTopColor: colors.ui.border,
    borderTopWidth: 1,
    paddingTop: 8,
    height: 85,
  },
  badge: {
    backgroundColor: colors.status.online,
    fontSize: 10,
  },
});
