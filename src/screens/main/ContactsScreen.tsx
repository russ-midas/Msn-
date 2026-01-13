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

import { colors, typography, spacing, borderRadius } from '../../theme';
import { RetroHeader, Avatar, StatusIndicator } from '../../components/common';
import { useContactsStore } from '../../stores/contactsStore';
import { useMessagesStore } from '../../stores/messagesStore';
import { useAuthStore } from '../../stores/authStore';
import { Contact, BuddyGroup, UserStatus } from '../../types';
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

function ContactItem({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        name={contact.displayName}
        uri={contact.avatarUrl}
        status={contact.presence.status}
        size="medium"
      />

      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName} numberOfLines={1}>
            {contact.displayName}
          </Text>
          {contact.isFavorite && (
            <Ionicons name="star" size={14} color={colors.aim.primary} />
          )}
        </View>

        <Text style={styles.screenName} numberOfLines={1}>
          {contact.screenName}
        </Text>

        {contact.presence.customMessage ? (
          <Text style={styles.statusMessage} numberOfLines={1}>
            {contact.presence.customMessage}
          </Text>
        ) : (
          <Text style={styles.statusLabel}>
            {statusLabels[contact.presence.status]}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

function BuddyGroupSection({
  group,
  contacts,
  onContactPress,
  onToggle,
}: {
  group: BuddyGroup;
  contacts: Contact[];
  onContactPress: (contact: Contact) => void;
  onToggle: () => void;
}) {
  const onlineCount = contacts.filter(
    (c) => c.presence.status !== 'offline' && c.presence.status !== 'invisible'
  ).length;

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity style={styles.groupHeader} onPress={onToggle} activeOpacity={0.7}>
        <Ionicons
          name={group.isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={colors.text.secondary}
        />
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupCount}>
          ({onlineCount}/{contacts.length})
        </Text>
      </TouchableOpacity>

      {group.isExpanded && (
        <View style={styles.groupContacts}>
          {contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onPress={() => onContactPress(contact)}
            />
          ))}
          {contacts.length === 0 && (
            <Text style={styles.emptyGroup}>No contacts in this group</Text>
          )}
        </View>
      )}
    </View>
  );
}

export function ContactsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const {
    contacts,
    buddyGroups,
    loadContacts,
    isLoading,
    getContactsByGroup,
    toggleGroupExpanded,
  } = useContactsStore();
  const { createConversation, conversations } = useMessagesStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: Contact) => {
    // Find or create conversation with this contact
    let conversation = conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(contact.id) &&
        c.participants.length === 2
    );

    if (!conversation) {
      conversation = createConversation([user?.id || 'user_1', contact.id]);
    }

    navigation.navigate('Chat', {
      conversationId: conversation.id,
      contactId: contact.id,
    });
  };

  const handleStatusPress = () => {
    navigation.navigate('Status');
  };

  return (
    <View style={styles.container}>
      <RetroHeader
        title="Buddy List"
        subtitle={`${contacts.filter((c) => c.presence.status !== 'offline').length} online`}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => {}}
      />

      {/* My Status Card */}
      {user && (
        <TouchableOpacity style={styles.myStatusCard} onPress={handleStatusPress}>
          <Avatar
            name={user.displayName}
            uri={user.avatarUrl}
            status={user.presence.status}
            size="large"
          />
          <View style={styles.myStatusInfo}>
            <Text style={styles.myName}>{user.displayName}</Text>
            <View style={styles.myStatusRow}>
              <StatusIndicator status={user.presence.status} size="small" />
              <Text style={styles.myStatusText}>
                {statusLabels[user.presence.status]}
              </Text>
            </View>
            {user.presence.customMessage && (
              <Text style={styles.myMessage} numberOfLines={1}>
                {user.presence.customMessage}
              </Text>
            )}
          </View>
          <Ionicons name="create-outline" size={20} color={colors.msn.secondary} />
        </TouchableOpacity>
      )}

      {/* Buddy Groups */}
      <FlatList
        data={buddyGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item: group }) => (
          <BuddyGroupSection
            group={group}
            contacts={getContactsByGroup(group.id)}
            onContactPress={handleContactPress}
            onToggle={() => toggleGroupExpanded(group.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.msn.secondary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  myStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ui.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    gap: spacing.md,
  },
  myStatusInfo: {
    flex: 1,
  },
  myName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  myStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  myStatusText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  myMessage: {
    ...typography.statusMessage,
    color: colors.text.muted,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  groupContainer: {
    marginBottom: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ui.surface,
    gap: spacing.xs,
  },
  groupName: {
    ...typography.screenName,
    color: colors.text.primary,
    flex: 1,
  },
  groupCount: {
    ...typography.caption,
    color: colors.text.muted,
  },
  groupContacts: {
    paddingLeft: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ui.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
    gap: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactName: {
    ...typography.screenName,
    color: colors.text.primary,
  },
  screenName: {
    ...typography.caption,
    color: colors.text.muted,
  },
  statusMessage: {
    ...typography.statusMessage,
    color: colors.msn.secondary,
    marginTop: 2,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  emptyGroup: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
