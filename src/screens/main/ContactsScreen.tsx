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
import { useNudgeStore } from '../../stores/nudgeStore';
import { getInteractionType, InteractionType } from '../../services/presenceService';
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

// Interaction badge showing what action is available
function InteractionBadge({ type, hoursUntilNudge }: { type: InteractionType; hoursUntilNudge: number | null }) {
  const config = {
    message: {
      icon: 'chatbubble' as const,
      color: colors.status.online,
      label: 'Message',
    },
    nudge: {
      icon: 'hand-left' as const,
      color: colors.status.away,
      label: 'Nudge',
    },
    nudge_limited: {
      icon: 'hand-left' as const,
      color: colors.status.offline,
      label: '1 Nudge',
    },
    none: {
      icon: 'time' as const,
      color: colors.text.muted,
      label: hoursUntilNudge ? `${hoursUntilNudge}h` : '—',
    },
  }[type];

  return (
    <View style={[styles.interactionBadge, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon} size={12} color={config.color} />
      <Text style={[styles.interactionLabel, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

function ContactItem({
  contact,
  onPress,
  interactionType,
  hoursUntilNudge,
}: {
  contact: Contact;
  onPress: () => void;
  interactionType: InteractionType;
  hoursUntilNudge: number | null;
}) {
  const isOnline = contact.presence.status === 'online';
  const isAway = ['away', 'busy', 'brb', 'phone', 'lunch'].includes(contact.presence.status);

  return (
    <TouchableOpacity
      style={[
        styles.contactItem,
        isOnline && styles.contactItemOnline,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar
        name={contact.displayName}
        uri={contact.avatarUrl}
        status={contact.presence.status}
        size="medium"
      />

      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={[styles.contactName, isOnline && styles.contactNameOnline]} numberOfLines={1}>
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
          <Text style={[styles.statusMessage, isOnline && styles.statusMessageOnline]} numberOfLines={1}>
            {contact.presence.customMessage}
          </Text>
        ) : (
          <Text style={styles.statusLabel}>
            {statusLabels[contact.presence.status]}
          </Text>
        )}
      </View>

      <InteractionBadge type={interactionType} hoursUntilNudge={hoursUntilNudge} />
    </TouchableOpacity>
  );
}

function BuddyGroupSection({
  group,
  contacts,
  onContactPress,
  onToggle,
  getInteractionInfo,
}: {
  group: BuddyGroup;
  contacts: Contact[];
  onContactPress: (contact: Contact) => void;
  onToggle: () => void;
  getInteractionInfo: (contactId: string) => { type: InteractionType; hoursUntilNudge: number | null };
}) {
  const onlineCount = contacts.filter((c) => c.presence.status === 'online').length;
  const awayCount = contacts.filter((c) =>
    ['away', 'busy', 'brb', 'phone', 'lunch'].includes(c.presence.status)
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
        <View style={styles.groupStats}>
          {onlineCount > 0 && (
            <View style={styles.groupStatBadge}>
              <View style={[styles.groupStatDot, { backgroundColor: colors.status.online }]} />
              <Text style={styles.groupStatText}>{onlineCount}</Text>
            </View>
          )}
          {awayCount > 0 && (
            <View style={styles.groupStatBadge}>
              <View style={[styles.groupStatDot, { backgroundColor: colors.status.away }]} />
              <Text style={styles.groupStatText}>{awayCount}</Text>
            </View>
          )}
          <Text style={styles.groupCount}>/ {contacts.length}</Text>
        </View>
      </TouchableOpacity>

      {group.isExpanded && (
        <View style={styles.groupContacts}>
          {contacts.map((contact) => {
            const { type, hoursUntilNudge } = getInteractionInfo(contact.id);
            return (
              <ContactItem
                key={contact.id}
                contact={contact}
                onPress={() => onContactPress(contact)}
                interactionType={type}
                hoursUntilNudge={hoursUntilNudge}
              />
            );
          })}
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
  const { getLastNudgeTime, getHoursUntilNextNudge } = useNudgeStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  // Get interaction info for a contact
  const getInteractionInfo = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return { type: 'none' as InteractionType, hoursUntilNudge: null };

    const lastNudgeTime = getLastNudgeTime(contactId);
    const type = getInteractionType(contact.presence.status, lastNudgeTime);
    const hoursUntilNudge = getHoursUntilNextNudge(contactId);

    return { type, hoursUntilNudge };
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

  // Count stats
  const onlineCount = contacts.filter((c) => c.presence.status === 'online').length;
  const awayCount = contacts.filter((c) =>
    ['away', 'busy', 'brb', 'phone', 'lunch'].includes(c.presence.status)
  ).length;

  return (
    <View style={styles.container}>
      <RetroHeader
        title="Buddy List"
        subtitle={`${onlineCount} online${awayCount > 0 ? `, ${awayCount} away` : ''}`}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => {}}
      />

      {/* Ephemeral Rules Info Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="chatbubble" size={14} color={colors.status.online} />
            <Text style={styles.infoText}>Online = Message</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="hand-left" size={14} color={colors.status.away} />
            <Text style={styles.infoText}>Away = Nudge</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={14} color={colors.status.offline} />
            <Text style={styles.infoText}>Offline = 1/24h</Text>
          </View>
        </View>
      </View>

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
            getInteractionInfo={getInteractionInfo}
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
  infoBanner: {
    backgroundColor: colors.ui.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.muted,
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
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  groupStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  groupStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  groupStatText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
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
  contactItemOnline: {
    backgroundColor: colors.status.online + '10',
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
  contactNameOnline: {
    color: colors.status.online,
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
  statusMessageOnline: {
    color: colors.status.online,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  interactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  interactionLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  emptyGroup: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
