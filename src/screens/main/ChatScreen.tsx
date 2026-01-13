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
import { RetroHeader, Avatar } from '../../components/common';
import { useMessagesStore } from '../../stores/messagesStore';
import { useContactsStore } from '../../stores/contactsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Message } from '../../types';
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

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRouteProp>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { conversationId, contactId } = route.params;
  const { getMessages, sendMessage, sendNudge, getConversation } = useMessagesStore();
  const { getContactById } = useContactsStore();
  const { showTimestamps, enterToSend } = useSettingsStore();

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

  const handleSend = () => {
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
    sendNudge(conversationId, 'user_1');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
        subtitle={
          displayContact?.presence.status
            ? displayContact.presence.customMessage || displayContact.presence.status
            : undefined
        }
        showBack
        onBackPress={() => navigation.goBack()}
        rightIcon="call-outline"
        onRightPress={() => {}}
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
              status={displayContact?.presence.status}
              size="large"
              showStatus={false}
            />
            <Text style={styles.emptyChatTitle}>Start a conversation!</Text>
            <Text style={styles.emptyChatSubtitle}>
              Say hello to {displayName} 👋
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

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || spacing.md }]}>
        <View style={styles.inputRow}>
          {/* Nudge Button - Classic MSN feature! */}
          <TouchableOpacity
            style={styles.nudgeButton}
            onPress={handleNudge}
            activeOpacity={0.7}
          >
            <Ionicons name="hand-left" size={24} color={colors.aim.primary} />
          </TouchableOpacity>

          {/* Emoji Button */}
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="happy-outline" size={24} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Text Input */}
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

          {/* Image Button */}
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="image-outline" size={24} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Send Button */}
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
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
  nudgeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ui.surfaceLight,
    borderRadius: borderRadius.full,
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
});
