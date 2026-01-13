import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader } from '../../components/common';
import { useSettingsStore } from '../../stores/settingsStore';
import { AppSettings } from '../../types';

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <Ionicons name={icon} size={22} color={colors.msn.secondary} />
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

function ThemeOption({
  theme,
  label,
  colors: themeColors,
  selected,
  onSelect,
}: {
  theme: AppSettings['theme'];
  label: string;
  colors: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.themeOption, selected && styles.themeOptionSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.themePreview}>
        {themeColors.map((color, index) => (
          <View key={index} style={[styles.themeColor, { backgroundColor: color }]} />
        ))}
      </View>
      <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={20} color={colors.msn.secondary} />
      )}
    </TouchableOpacity>
  );
}

function FontSizeOption({
  size,
  selected,
  onSelect,
}: {
  size: AppSettings['fontSize'];
  selected: boolean;
  onSelect: () => void;
}) {
  const sizeMap = { small: 14, medium: 16, large: 18 };

  return (
    <TouchableOpacity
      style={[styles.fontSizeOption, selected && styles.fontSizeOptionSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={[styles.fontSizeText, { fontSize: sizeMap[size] }]}>Aa</Text>
      <Text style={styles.fontSizeLabel}>{size.charAt(0).toUpperCase() + size.slice(1)}</Text>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const {
    theme,
    soundsEnabled,
    notificationsEnabled,
    showTimestamps,
    enterToSend,
    showOfflineContacts,
    compactMode,
    fontSize,
    setTheme,
    toggleSounds,
    toggleNotifications,
    toggleTimestamps,
    toggleEnterToSend,
    toggleShowOfflineContacts,
    toggleCompactMode,
    setFontSize,
    resetSettings,
  } = useSettingsStore();

  const themes: { id: AppSettings['theme']; label: string; colors: string[] }[] = [
    { id: 'msn', label: 'MSN', colors: [colors.msn.primary, colors.msn.secondary] },
    { id: 'aim', label: 'AIM', colors: [colors.aim.primary, colors.aim.secondary] },
    { id: 'icq', label: 'ICQ', colors: [colors.icq.green, colors.icq.flower] },
    { id: 'modern', label: 'Modern', colors: [colors.ui.surface, colors.ui.surfaceLight] },
  ];

  return (
    <View style={styles.container}>
      <RetroHeader
        title="Settings"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Selection */}
        <SettingSection title="Theme">
          <View style={styles.themeGrid}>
            {themes.map((t) => (
              <ThemeOption
                key={t.id}
                theme={t.id}
                label={t.label}
                colors={t.colors}
                selected={theme === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </View>
        </SettingSection>

        {/* Font Size */}
        <SettingSection title="Font Size">
          <View style={styles.fontSizeGrid}>
            {(['small', 'medium', 'large'] as AppSettings['fontSize'][]).map((size) => (
              <FontSizeOption
                key={size}
                size={size}
                selected={fontSize === size}
                onSelect={() => setFontSize(size)}
              />
            ))}
          </View>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications & Sounds">
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            description="Receive notifications for new messages"
          >
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>

          <SettingRow
            icon="volume-high-outline"
            label="Sound Effects"
            description="Play sounds for messages and nudges"
          >
            <Switch
              value={soundsEnabled}
              onValueChange={toggleSounds}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>
        </SettingSection>

        {/* Chat Settings */}
        <SettingSection title="Chat">
          <SettingRow
            icon="time-outline"
            label="Show Timestamps"
            description="Display time on each message"
          >
            <Switch
              value={showTimestamps}
              onValueChange={toggleTimestamps}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>

          <SettingRow
            icon="return-down-back-outline"
            label="Enter to Send"
            description="Press Enter to send messages"
          >
            <Switch
              value={enterToSend}
              onValueChange={toggleEnterToSend}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>
        </SettingSection>

        {/* Contacts Settings */}
        <SettingSection title="Contacts">
          <SettingRow
            icon="people-outline"
            label="Show Offline Contacts"
            description="Display offline buddies in your list"
          >
            <Switch
              value={showOfflineContacts}
              onValueChange={toggleShowOfflineContacts}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>

          <SettingRow
            icon="list-outline"
            label="Compact Mode"
            description="Show more contacts with smaller items"
          >
            <Switch
              value={compactMode}
              onValueChange={toggleCompactMode}
              trackColor={{ false: colors.ui.surfaceLight, true: colors.msn.secondary }}
              thumbColor={colors.text.primary}
            />
          </SettingRow>
        </SettingSection>

        {/* Reset Settings */}
        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <Ionicons name="refresh-outline" size={20} color={colors.status.busy} />
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.ui.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: colors.ui.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeOptionSelected: {
    borderColor: colors.msn.secondary,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 4,
  },
  themeColor: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
  },
  themeLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  themeLabelSelected: {
    color: colors.msn.secondary,
    fontWeight: '600',
  },
  fontSizeGrid: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  fontSizeOption: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.ui.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fontSizeOptionSelected: {
    borderColor: colors.msn.secondary,
  },
  fontSizeText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  fontSizeLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.ui.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.status.busy,
  },
  resetText: {
    ...typography.body,
    color: colors.status.busy,
  },
});
