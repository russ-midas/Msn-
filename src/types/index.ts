/**
 * Core types for Retro Messenger
 */

// User status options (classic MSN style)
export type UserStatus = 'online' | 'away' | 'busy' | 'brb' | 'phone' | 'lunch' | 'invisible' | 'offline';

// User presence info
export interface UserPresence {
  status: UserStatus;
  customMessage?: string;
  lastSeen?: Date;
  isTyping?: boolean;
}

// User/Contact model
export interface User {
  id: string;
  email: string;
  screenName: string;
  displayName: string;
  avatarUrl?: string;
  presence: UserPresence;
  createdAt: Date;
}

// Contact with relationship info
export interface Contact extends User {
  nickname?: string; // Custom nickname for this contact
  group?: string; // Buddy group
  isBlocked: boolean;
  isFavorite: boolean;
  addedAt: Date;
}

// Message model
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentType: MessageContentType;
  timestamp: Date;
  status: MessageStatus;
  reactions?: MessageReaction[];
  replyTo?: string; // Message ID being replied to
  isEdited?: boolean;
  editedAt?: Date;
}

export type MessageContentType = 'text' | 'image' | 'file' | 'nudge' | 'wink' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

// Conversation model
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[]; // User IDs
  name?: string; // For group chats
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Buddy groups (classic MSN feature)
export interface BuddyGroup {
  id: string;
  name: string;
  order: number;
  isExpanded: boolean;
  contactIds: string[];
}

// App settings
export interface AppSettings {
  theme: 'msn' | 'aim' | 'icq' | 'modern';
  soundsEnabled: boolean;
  notificationsEnabled: boolean;
  showTimestamps: boolean;
  enterToSend: boolean;
  showOfflineContacts: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

// Nudge/Buzz feature (classic MSN)
export interface Nudge {
  senderId: string;
  receiverId: string;
  timestamp: Date;
}

// Emoticon/Emoji
export interface CustomEmoticon {
  id: string;
  shortcut: string; // e.g., ":)" or "(cool)"
  imageUrl: string;
  name: string;
}

// Classic MSN winks
export interface Wink {
  id: string;
  name: string;
  animationUrl: string;
  soundUrl?: string;
}
