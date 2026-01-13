import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader, StatusIndicator, Button } from '../../components/common';
import { useAuthStore } from '../../stores/authStore';
import { UserStatus } from '../../types';

interface StatusOption {
  status: UserStatus;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const statusOptions: StatusOption[] = [
  {
    status: 'online',
    label: 'Online',
    description: 'Show as available to chat',
    icon: 'radio-button-on',
  },
  {
    status: 'away',
    label: 'Away',
    description: 'Show as away from keyboard',
    icon: 'time-outline',
  },
  {
    status: 'busy',
    label: 'Busy',
    description: 'Show as busy, minimize notifications',
    icon: 'remove-circle-outline',
  },
  {
    status: 'brb',
    label: 'Be Right Back',
    description: "You'll be back soon",
    icon: 'arrow-back-circle-outline',
  },
  {
    status: 'phone',
    label: 'On the Phone',
    description: 'Currently on a call',
    icon: 'call-outline',
  },
  {
    status: 'lunch',
    label: 'Out to Lunch',
    description: 'Taking a break',
    icon: 'restaurant-outline',
  },
  {
    status: 'invisible',
    label: 'Invisible',
    description: 'Appear offline to everyone',
    icon: 'eye-off-outline',
  },
];

const quickMessages = [
  '🎵 Listening to music~',
  '📚 Studying hard!',
  '🎮 Gaming time!',
  '💼 Working...',
  '☕ Coffee break',
  '🏃 BRB!',
  '😴 ZzZzZ...',
  '🎉 Party mode!',
];

export function StatusScreen() {
  const navigation = useNavigation();
  const { user, setStatus } = useAuthStore();

  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(
    user?.presence.status || 'online'
  );
  const [customMessage, setCustomMessage] = useState(user?.presence.customMessage || '');

  const handleStatusSelect = (status: UserStatus) => {
    setSelectedStatus(status);
    Haptics.selectionAsync();
  };

  const handleQuickMessage = (message: string) => {
    setCustomMessage(message);
    Haptics.selectionAsync();
  };

  const handleSave = () => {
    setStatus(selectedStatus, customMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <RetroHeader
        title="Set Status"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status Preview */}
        <View style={styles.previewCard}>
          <StatusIndicator status={selectedStatus} size="large" />
          <View style={styles.previewInfo}>
            <Text style={styles.previewLabel}>
              {statusOptions.find((s) => s.status === selectedStatus)?.label || 'Online'}
            </Text>
            <Text style={styles.previewMessage} numberOfLines={1}>
              {customMessage || 'No status message'}
            </Text>
          </View>
        </View>

        {/* Status Options */}
        <Text style={styles.sectionTitle}>Choose Status</Text>
        <View style={styles.statusGrid}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.status}
              style={[
                styles.statusOption,
                selectedStatus === option.status && styles.statusOptionSelected,
              ]}
              onPress={() => handleStatusSelect(option.status)}
              activeOpacity={0.7}
            >
              <View style={styles.statusOptionHeader}>
                <StatusIndicator status={option.status} size="medium" />
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={
                    selectedStatus === option.status
                      ? colors.msn.secondary
                      : colors.text.muted
                  }
                />
              </View>
              <Text
                style={[
                  styles.statusOptionLabel,
                  selectedStatus === option.status && styles.statusOptionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.statusOptionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Message */}
        <Text style={styles.sectionTitle}>Status Message</Text>
        <View style={styles.messageSection}>
          <TextInput
            style={styles.messageInput}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.text.muted}
            maxLength={100}
            multiline
          />
          <Text style={styles.charCount}>{customMessage.length}/100</Text>
        </View>

        {/* Quick Messages */}
        <Text style={styles.sectionTitle}>Quick Messages</Text>
        <View style={styles.quickMessages}>
          {quickMessages.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickMessage,
                customMessage === message && styles.quickMessageSelected,
              ]}
              onPress={() => handleQuickMessage(message)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickMessageText,
                  customMessage === message && styles.quickMessageTextSelected,
                ]}
              >
                {message}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <Button
          title="Save Status"
          onPress={handleSave}
          size="large"
          style={styles.saveButton}
        />
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ui.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  previewInfo: {
    flex: 1,
  },
  previewLabel: {
    ...typography.h4,
    color: colors.text.primary,
  },
  previewMessage: {
    ...typography.statusMessage,
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusOption: {
    width: '48%',
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: colors.msn.secondary,
    backgroundColor: colors.ui.surfaceLight,
  },
  statusOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusOptionLabel: {
    ...typography.screenName,
    color: colors.text.primary,
  },
  statusOptionLabelSelected: {
    color: colors.msn.secondary,
  },
  statusOptionDescription: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  messageSection: {
    backgroundColor: colors.ui.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    padding: spacing.md,
  },
  messageInput: {
    ...typography.body,
    color: colors.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickMessage: {
    backgroundColor: colors.ui.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  quickMessageSelected: {
    backgroundColor: colors.msn.primary,
    borderColor: colors.msn.secondary,
  },
  quickMessageText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  quickMessageTextSelected: {
    color: colors.text.primary,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
