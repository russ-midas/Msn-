import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday } from 'date-fns';

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader, Avatar, StatusIndicator } from '../../components/common';
import { useMessagesStore } from '../../stores/messagesStore';
import { useContactsStore } from '../../stores/contactsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNudgeStore } from '../../stores/nudgeStore';
import { getInteractionType, InteractionType } from '../../services/presenceService';
import { Message, UserStatus } from '../../types';
import { MainStackParamList } from '../../navigation';

type ChatRouteProp = RouteProp<MainStackParamList, 'Chat'>;

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
}

function MessageBubble({
  message,
  isOwn,
  showTimestamp,
}: {
  message: Message;
  isOwn: boolean;
  showTimestamp: boolean;
}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message.contentType === 'nudge') {
      // Shake animation for nudge
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [message.contentType]);

  if (message.contentType === 'nudge') {
    return (
      <Animated.View
        style={[styles.nudgeContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Ionicons name="hand-left" size={24} color={colors.aim.primary} />
        <Text style={styles.nudgeText}>
          {isOwn ? 'You sent a nudge!' : 'You received a nudge!'}
        </Text>
      </Animated.View>
    );
  }

  if (message.contentType === 'system') {
    return (
      <View style={styles.systemMessage}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
        ]}
      >
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {message.content}
        </Text>

        {showTimestamp && (
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatMessageTime(new Date(message.timestamp))}
            </Text>
            {isOwn && (
              <Ionicons
                name={
                  message.status === 'read'
                    ? 'checkmark-done'
                    : message.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={14}
                color={message.status === 'read' ? colors.msn.light : colors.text.muted}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// Status banner component showing interaction rules
function StatusBanner({
  status,
  interactionType,
  hoursUntilNudge,
  displayName,
}: {
  status: UserStatus;
  interactionType: InteractionType;
  hoursUntilNudge: number | null;
  displayName: string;
}) {
  const getStatusConfig = () => {
    switch (interactionType) {
      case 'message':
        return {
          color: colors.status.online,
          icon: 'chatbubble' as const,
          text: `${displayName} is online - send a message!`,
        };
      case 'nudge':
        return {
          color: colors.status.away,
          icon: 'hand-left' as const,
          text: `${displayName} is away - send a nudge to get their attention`,
        };
      case 'nudge_limited':
        return {
          color: colors.status.offline,
          icon: 'hand-left' as const,
          text: `${displayName} is offline - you can send one nudge`,
        };
      case 'none':
        return {
          color: colors.status.offline,
          icon: 'time' as const,
          text: hoursUntilNudge
            ? `Already nudged - wait ${hoursUntilNudge}h to nudge again`
            : `${displayName} is unavailable`,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBanner, { backgroundColor: config.color + '20' }]}>
      <StatusIndicator status={status} size="small" />
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text style={[styles.statusBannerText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
}

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRouteProp>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { conversationId, contactId } = route.params;
  const { getMessages, sendMessage, sendNudge, getConversation } = useMessagesStore();
  const { getContactById } = useContactsStore();
  const { showTimestamps, enterToSend } = useSettingsStore();
  const { recordNudge, getLastNudgeTime, canNudgeOfflineUser, getHoursUntilNextNudge } = useNudgeStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messages = getMessages(conversationId);
  const conversation = getConversation(conversationId);
  const contact = contactId ? getContactById(contactId) : undefined;

  // Determine contact from conversation if not provided
  const displayContact =
    contact ||
    (conversation?.participants
      .filter((p) => p !== 'user_1')
      .map((id) => getContactById(id))[0]);

  const displayName =
    conversation?.name || displayContact?.displayName || displayContact?.screenName || 'Chat';

  const contactStatus = displayContact?.presence.status || 'offline';
  const lastNudgeTime = displayContact ? getLastNudgeTime(displayContact.id) : null;
  const interactionType = getInteractionType(contactStatus, lastNudgeTime);
  const hoursUntilNudge = displayContact ? getHoursUntilNextNudge(displayContact.id) : null;

  // Determine what actions are available
  const canMessage = interactionType === 'message';
  const canNudge = interactionType === 'nudge' || interactionType === 'nudge_limited';
  const isOfflineNudge = interactionType === 'nudge_limited';

  const handleSend = () => {
    if (!canMessage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (inputText.trim()) {
      sendMessage(conversationId, inputText.trim());
      setInputText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleNudge = () => {
    if (!canNudge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Record the nudge (especially important for offline users)
    if (displayContact) {
      recordNudge(displayContact.id, isOfflineNudge);
    }

    sendNudge(conversationId, 'user_1');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleKeyPress = (e: any) => {
    if (enterToSend && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <RetroHeader
        title={displayName}
        subtitle={contactStatus}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Status Banner - Shows interaction rules */}
      <StatusBanner
        status={contactStatus}
        interactionType={interactionType}
        hoursUntilNudge={hoursUntilNudge}
        displayName={displayName}
      />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.senderId === 'user_1'}
            showTimestamp={showTimestamps}
          />
        )}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Avatar
              name={displayName}
              status={contactStatus}
              size="large"
            />
            <Text style={styles.emptyChatTitle}>
              {canMessage ? 'Start a conversation!' : 'Waiting for them...'}
            </Text>
            <Text style={styles.emptyChatSubtitle}>
              {canMessage
                ? `Say hello to ${displayName} 👋`
                : canNudge
                ? `Send a nudge to let ${displayName} know you're here`
                : `${displayName} is offline`}
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{displayName} is typing...</Text>
        </View>
      )}

      {/* Input Area - Conditional based on interaction type */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || spacing.md }]}>
        {canMessage ? (
          // Online - Show full messaging UI
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="happy-outline" size={24} color={colors.text.muted} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={2000}
              onKeyPress={handleKeyPress}
            />

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="image-outline" size={24} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.text.primary : colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        ) : canNudge ? (
          // Away or Offline (with nudge available) - Show nudge UI
          <TouchableOpacity
            style={styles.nudgeFullButton}
            onPress={handleNudge}
            activeOpacity={0.7}
          >
            <Ionicons name="hand-left" size={28} color={colors.aim.primary} />
            <View style={styles.nudgeButtonContent}>
              <Text style={styles.nudgeButtonTitle}>Send a Nudge</Text>
              <Text style={styles.nudgeButtonSubtitle}>
                {isOfflineNudge
                  ? 'Let them know you want to chat (1 per 24h)'
                  : 'Get their attention!'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.aim.primary} />
          </TouchableOpacity>
        ) : (
          // No interaction available
          <View style={styles.noInteractionContainer}>
            <Ionicons name="time-outline" size={24} color={colors.text.muted} />
            <Text style={styles.noInteractionText}>
              {hoursUntilNudge
                ? `You've already nudged ${displayName}. Try again in ${hoursUntilNudge}h.`
                : `${displayName} is unavailable right now.`}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  statusBannerText: {
    ...typography.bodySmall,
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageBubbleOwn: {
    backgroundColor: colors.message.sent,
    borderBottomRightRadius: borderRadius.sm,
  },
  messageBubbleOther: {
    backgroundColor: colors.message.received,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageText: {
    ...typography.chatMessage,
    color: colors.message.receivedText,
  },
  messageTextOwn: {
    color: colors.message.sentText,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  messageTime: {
    ...typography.timestamp,
    color: colors.text.muted,
  },
  nudgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  nudgeText: {
    ...typography.bodySmall,
    color: colors.aim.primary,
    fontWeight: '600',
  },
  systemMessage: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  systemText: {
    ...typography.caption,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyChatTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyChatSubtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  typingIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typingText: {
    ...typography.caption,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.ui.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.ui.surfaceLight,
  },
  sendButtonActive: {
    backgroundColor: colors.msn.primary,
  },
  nudgeFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.aim.primary + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.aim.primary + '40',
  },
  nudgeButtonContent: {
    flex: 1,
  },
  nudgeButtonTitle: {
    ...typography.screenName,
    color: colors.aim.primary,
  },
  nudgeButtonSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  noInteractionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  noInteractionText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    flex: 1,
  },
});
