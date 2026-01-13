import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, MessageContentType, MessageStatus } from '../types';

interface MessagesState {
  // State
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  activeConversationId: string | null;
  isLoading: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  createConversation: (participantIds: string[], name?: string) => Conversation;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;

  // Messages
  sendMessage: (conversationId: string, content: string, contentType?: MessageContentType) => Message;
  deleteMessage: (conversationId: string, messageId: string) => void;
  editMessage: (conversationId: string, messageId: string, newContent: string) => void;
  markAsRead: (conversationId: string) => void;

  // Special features
  sendNudge: (conversationId: string, senderId: string) => Message;

  // Conversation settings
  togglePinConversation: (conversationId: string) => void;
  toggleMuteConversation: (conversationId: string) => void;

  // Selectors
  getConversation: (conversationId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
  getUnreadCount: () => number;
}

// Demo conversations and messages
const demoConversations: Conversation[] = [
  {
    id: 'conv_1',
    type: 'direct',
    participants: ['user_1', 'contact_1'],
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'conv_2',
    type: 'direct',
    participants: ['user_1', 'contact_3'],
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'conv_3',
    type: 'group',
    participants: ['user_1', 'contact_1', 'contact_2', 'contact_3'],
    name: 'Weekend Plans 🎉',
    unreadCount: 5,
    isPinned: false,
    isMuted: false,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'conv_4',
    type: 'direct',
    participants: ['user_1', 'contact_6'],
    unreadCount: 1,
    isPinned: true,
    isMuted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(Date.now() - 7200000),
  },
];

const demoMessages: Record<string, Message[]> = {
  conv_1: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'contact_1',
      content: 'Hey! How are you? 😊',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'user_1',
      content: "I'm doing great! Just got home from work",
      contentType: 'text',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
    },
    {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'contact_1',
      content: 'Nice! Want to hang out this weekend?',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
    },
    {
      id: 'msg_4',
      conversationId: 'conv_1',
      senderId: 'contact_1',
      content: "We could go to that new coffee place! ☕",
      contentType: 'text',
      timestamp: new Date(Date.now() - 600000),
      status: 'delivered',
    },
    {
      id: 'msg_5',
      conversationId: 'conv_1',
      senderId: 'contact_1',
      content: 'Let me know! 💕',
      contentType: 'text',
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered',
    },
  ],
  conv_2: [
    {
      id: 'msg_6',
      conversationId: 'conv_2',
      senderId: 'user_1',
      content: 'Good luck with studying!',
      contentType: 'text',
      timestamp: new Date(Date.now() - 7200000),
      status: 'read',
    },
    {
      id: 'msg_7',
      conversationId: 'conv_2',
      senderId: 'contact_3',
      content: 'Thanks! I really need it 😅',
      contentType: 'text',
      timestamp: new Date(Date.now() - 7100000),
      status: 'read',
    },
  ],
  conv_3: [
    {
      id: 'msg_8',
      conversationId: 'conv_3',
      senderId: 'contact_2',
      content: "So what's the plan for Saturday?",
      contentType: 'text',
      timestamp: new Date(Date.now() - 5400000),
      status: 'read',
    },
    {
      id: 'msg_9',
      conversationId: 'conv_3',
      senderId: 'contact_1',
      content: 'Movie night at my place? 🍿',
      contentType: 'text',
      timestamp: new Date(Date.now() - 5000000),
      status: 'read',
    },
    {
      id: 'msg_10',
      conversationId: 'conv_3',
      senderId: 'contact_3',
      content: "I'm in!",
      contentType: 'text',
      timestamp: new Date(Date.now() - 4500000),
      status: 'delivered',
    },
  ],
  conv_4: [
    {
      id: 'msg_11',
      conversationId: 'conv_4',
      senderId: 'contact_6',
      content: 'Call me when you get home sweetheart ❤️',
      contentType: 'text',
      timestamp: new Date(Date.now() - 10800000),
      status: 'delivered',
    },
  ],
};

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      isLoading: false,

      loadConversations: async () => {
        set({ isLoading: true });

        await new Promise((resolve) => setTimeout(resolve, 300));

        const { conversations, messages } = get();
        if (conversations.length === 0) {
          // Update demo conversations with last messages
          const updatedConversations = demoConversations.map((conv) => ({
            ...conv,
            lastMessage: demoMessages[conv.id]?.[demoMessages[conv.id].length - 1],
          }));

          set({
            conversations: updatedConversations,
            messages: demoMessages,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      },

      createConversation: (participantIds, name) => {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          type: participantIds.length > 2 ? 'group' : 'direct',
          participants: participantIds,
          name,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          messages: { ...state.messages, [newConversation.id]: [] },
        }));

        return newConversation;
      },

      deleteConversation: (conversationId) => {
        set((state) => {
          const { [conversationId]: _, ...remainingMessages } = state.messages;
          return {
            conversations: state.conversations.filter((c) => c.id !== conversationId),
            messages: remainingMessages,
          };
        });
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        if (conversationId) {
          get().markAsRead(conversationId);
        }
      },

      sendMessage: (conversationId, content, contentType = 'text') => {
        const newMessage: Message = {
          id: `msg_${Date.now()}`,
          conversationId,
          senderId: 'user_1', // Current user
          content,
          contentType,
          timestamp: new Date(),
          status: 'sent',
        };

        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...conversationMessages, newMessage],
            },
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
                : conv
            ),
          };
        });

        // Simulate delivery
        setTimeout(() => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId].map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: 'delivered' as MessageStatus } : msg
              ),
            },
          }));
        }, 1000);

        return newMessage;
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].filter(
              (m) => m.id !== messageId
            ),
          },
        }));
      },

      editMessage: (conversationId, messageId, newContent) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((m) =>
              m.id === messageId
                ? { ...m, content: newContent, isEdited: true, editedAt: new Date() }
                : m
            ),
          },
        }));
      },

      markAsRead: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map((m) =>
              m.status === 'delivered' ? { ...m, status: 'read' as MessageStatus } : m
            ),
          },
        }));
      },

      sendNudge: (conversationId, senderId) => {
        return get().sendMessage(conversationId, '👋 *NUDGE!*', 'nudge');
      },

      togglePinConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
          ),
        }));
      },

      toggleMuteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
          ),
        }));
      },

      getConversation: (conversationId) => {
        return get().conversations.find((c) => c.id === conversationId);
      },

      getMessages: (conversationId) => {
        return get().messages[conversationId] || [];
      },

      getUnreadCount: () => {
        return get().conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
      },
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
);
