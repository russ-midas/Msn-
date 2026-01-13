import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader, Avatar, StatusIndicator } from '../../components/common';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { UserStatus } from '../../types';
import { MainStackParamList } from '../../navigation';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const statusLabels: Record<UserStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  brb: 'Be Right Back',
  phone: 'On the Phone',
  lunch: 'Out to Lunch',
  invisible: 'Invisible',
  offline: 'Offline',
};

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuTitle}>{title}</Text>
      <View style={styles.menuItems}>{children}</View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? colors.status.busy : colors.msn.secondary}
      />
      <Text style={[styles.menuItemLabel, danger && styles.dangerText]}>{label}</Text>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuthStore();
  const { theme } = useSettingsStore();

  if (!user) return null;

  const handleStatusPress = () => {
    navigation.navigate('Status');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <RetroHeader title="My Profile" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={colors.gradients.msnHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <Avatar
              name={user.displayName}
              uri={user.avatarUrl}
              status={user.presence.status}
              size="large"
            />

            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.screenName}>{user.screenName}</Text>

          <TouchableOpacity style={styles.statusCard} onPress={handleStatusPress}>
            <StatusIndicator status={user.presence.status} size="medium" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>
                {statusLabels[user.presence.status]}
              </Text>
              {user.presence.customMessage && (
                <Text style={styles.statusMessage} numberOfLines={1}>
                  {user.presence.customMessage}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleStatusPress}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.status.online }]}>
              <Ionicons name="radio-button-on" size={20} color={colors.text.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.aim.primary }]}>
              <Ionicons name="happy" size={20} color={colors.text.inverse} />
            </View>
            <Text style={styles.quickActionLabel}>Mood</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.icq.green }]}>
              <Ionicons name="musical-notes" size={20} color={colors.text.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Music</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.ui.surfaceLight }]}>
              <Ionicons name="qr-code" size={20} color={colors.text.primary} />
            </View>
            <Text style={styles.quickActionLabel}>QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <MenuSection title="Account">
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="mail-outline"
            label="Email"
            value={user.email}
            showArrow={false}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy"
            onPress={() => {}}
          />
        </MenuSection>

        <MenuSection title="Customization">
          <MenuItem
            icon="color-palette-outline"
            label="Theme"
            value={theme.toUpperCase()}
            onPress={handleSettingsPress}
          />
          <MenuItem
            icon="image-outline"
            label="Display Picture"
            onPress={() => {}}
          />
          <MenuItem
            icon="happy-outline"
            label="Emoticons"
            onPress={() => {}}
          />
        </MenuSection>

        <MenuSection title="App">
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={handleSettingsPress}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() => {}}
          />
        </MenuSection>

        <MenuSection title="">
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
            danger
            showArrow={false}
          />
        </MenuSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Retro Messenger v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with 💚 nostalgia</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  profileHeader: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.msn.light,
  },
  displayName: {
    ...typography.h2,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  screenName: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  statusMessage: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menuSection: {
    marginBottom: spacing.md,
  },
  menuTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuItems: {
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.ui.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  menuItemValue: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  dangerText: {
    color: colors.status.busy,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});
