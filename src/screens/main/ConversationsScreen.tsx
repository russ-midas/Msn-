import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader, Avatar } from '../../components/common';
import { useMessagesStore } from '../../stores/messagesStore';
import { useContactsStore } from '../../stores/contactsStore';
import { Conversation } from '../../types';
import { MainStackParamList } from '../../navigation';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

function ConversationItem({
  conversation,
  onPress,
  contactName,
  contactStatus,
}: {
  conversation: Conversation;
  onPress: () => void;
  contactName: string;
  contactStatus?: string;
}) {
  const displayName = conversation.name || contactName;
  const lastMessage = conversation.lastMessage;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={[styles.conversationItem, hasUnread && styles.unreadItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          name={displayName}
          status={contactStatus as any}
          showStatus={conversation.type === 'direct'}
          size="medium"
        />
        {conversation.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={10} color={colors.text.primary} />
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, hasUnread && styles.unreadText]} numberOfLines={1}>
            {displayName}
          </Text>
          {lastMessage && (
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
            </Text>
          )}
        </View>

        <View style={styles.lastMessageRow}>
          {lastMessage?.contentType === 'nudge' ? (
            <View style={styles.nudgeMessage}>
              <Ionicons name="hand-left" size={14} color={colors.aim.primary} />
              <Text style={styles.nudgeText}>Nudge!</Text>
            </View>
          ) : (
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {lastMessage?.content || 'No messages yet'}
            </Text>
          )}

          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {conversation.isMuted && (
        <Ionicons name="volume-mute" size={16} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  );
}

export function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { conversations, loadConversations, isLoading } = useMessagesStore();
  const { contacts, getContactById } = useContactsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  // Sort conversations: pinned first, then by last message time
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getConversationContact = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return { name: conversation.name || 'Group Chat', status: undefined };
    }

    const contactId = conversation.participants.find((p) => p !== 'user_1');
    const contact = contactId ? getContactById(contactId) : undefined;

    return {
      name: contact?.displayName || contact?.screenName || 'Unknown',
      status: contact?.presence.status,
    };
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <View style={styles.container}>
      <RetroHeader
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} unread` : 'All caught up!'}
        rightIcon="create-outline"
        onRightPress={() => {}}
      />

      {sortedConversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={80} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start chatting with your buddies from the Contacts tab!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { name, status } = getConversationContact(item);
            return (
              <ConversationItem
                conversation={item}
                contactName={name}
                contactStatus={status}
                onPress={() => handleConversationPress(item)}
              />
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.msn.secondary}
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  unreadItem: {
    backgroundColor: colors.ui.surface,
  },
  avatarContainer: {
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.msn.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    ...typography.screenName,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  timestamp: {
    ...typography.timestamp,
    color: colors.text.muted,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadText: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  nudgeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nudgeText: {
    ...typography.bodySmall,
    color: colors.aim.primary,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.status.online,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.ui.divider,
    marginHorizontal: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
