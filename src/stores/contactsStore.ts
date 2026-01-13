import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, BuddyGroup, UserStatus } from '../types';

interface ContactsState {
  // State
  contacts: Contact[];
  buddyGroups: BuddyGroup[];
  isLoading: boolean;

  // Actions
  loadContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'addedAt'>) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  blockContact: (contactId: string) => void;
  unblockContact: (contactId: string) => void;
  toggleFavorite: (contactId: string) => void;

  // Buddy groups
  createGroup: (name: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, name: string) => void;
  toggleGroupExpanded: (groupId: string) => void;
  moveContactToGroup: (contactId: string, groupId: string) => void;

  // Selectors
  getOnlineContacts: () => Contact[];
  getOfflineContacts: () => Contact[];
  getContactsByGroup: (groupId: string) => Contact[];
  getContactById: (contactId: string) => Contact | undefined;
}

// Demo contacts with classic MSN-style data
const demoContacts: Contact[] = [
  {
    id: 'contact_1',
    email: 'sarah@hotmail.com',
    screenName: 'xX_SarahBear_Xx',
    displayName: 'Sarah 💕',
    avatarUrl: undefined,
    presence: {
      status: 'online',
      customMessage: '🎵 Listening to music~',
    },
    createdAt: new Date('2024-01-15'),
    isBlocked: false,
    isFavorite: true,
    addedAt: new Date('2024-01-15'),
    group: 'friends',
  },
  {
    id: 'contact_2',
    email: 'mike@hotmail.com',
    screenName: 'MikeGamer2000',
    displayName: 'Mike',
    avatarUrl: undefined,
    presence: {
      status: 'away',
      customMessage: 'BRB - eating dinner',
    },
    createdAt: new Date('2024-02-20'),
    isBlocked: false,
    isFavorite: false,
    addedAt: new Date('2024-02-20'),
    group: 'friends',
  },
  {
    id: 'contact_3',
    email: 'jenny@yahoo.com',
    screenName: '*~Jenny~*',
    displayName: 'Jenny',
    avatarUrl: undefined,
    presence: {
      status: 'busy',
      customMessage: 'Do not disturb - studying!',
    },
    createdAt: new Date('2024-03-10'),
    isBlocked: false,
    isFavorite: true,
    addedAt: new Date('2024-03-10'),
    group: 'friends',
  },
  {
    id: 'contact_4',
    email: 'dave@gmail.com',
    screenName: 'DaveFromWork',
    displayName: 'Dave (Work)',
    avatarUrl: undefined,
    presence: {
      status: 'online',
      customMessage: 'In meetings all day 📊',
    },
    createdAt: new Date('2024-04-05'),
    isBlocked: false,
    isFavorite: false,
    addedAt: new Date('2024-04-05'),
    group: 'work',
  },
  {
    id: 'contact_5',
    email: 'emma@company.com',
    screenName: 'EmmaDesigns',
    displayName: 'Emma',
    avatarUrl: undefined,
    presence: {
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
    },
    createdAt: new Date('2024-04-12'),
    isBlocked: false,
    isFavorite: false,
    addedAt: new Date('2024-04-12'),
    group: 'work',
  },
  {
    id: 'contact_6',
    email: 'mom@email.com',
    screenName: 'Mom ❤️',
    displayName: 'Mom',
    avatarUrl: undefined,
    presence: {
      status: 'online',
      customMessage: '',
    },
    createdAt: new Date('2024-01-01'),
    isBlocked: false,
    isFavorite: true,
    addedAt: new Date('2024-01-01'),
    group: 'family',
  },
  {
    id: 'contact_7',
    email: 'bro@email.com',
    screenName: 'LittleBro',
    displayName: 'Jake (Brother)',
    avatarUrl: undefined,
    presence: {
      status: 'invisible',
    },
    createdAt: new Date('2024-01-02'),
    isBlocked: false,
    isFavorite: false,
    addedAt: new Date('2024-01-02'),
    group: 'family',
  },
];

const defaultGroups: BuddyGroup[] = [
  { id: 'favorites', name: '⭐ Favorites', order: 0, isExpanded: true, contactIds: [] },
  { id: 'friends', name: '👥 Friends', order: 1, isExpanded: true, contactIds: [] },
  { id: 'family', name: '👨‍👩‍👧‍👦 Family', order: 2, isExpanded: true, contactIds: [] },
  { id: 'work', name: '💼 Work', order: 3, isExpanded: true, contactIds: [] },
  { id: 'other', name: '📋 Other', order: 4, isExpanded: false, contactIds: [] },
];

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      buddyGroups: defaultGroups,
      isLoading: false,

      loadContacts: async () => {
        set({ isLoading: true });

        // Simulate loading
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { contacts } = get();
        if (contacts.length === 0) {
          set({ contacts: demoContacts, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      addContact: (contact) => {
        const newContact: Contact = {
          ...contact,
          addedAt: new Date(),
        };
        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));
      },

      removeContact: (contactId) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== contactId),
        }));
      },

      updateContact: (contactId, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contactId ? { ...c, ...updates } : c
          ),
        }));
      },

      blockContact: (contactId) => {
        get().updateContact(contactId, { isBlocked: true });
      },

      unblockContact: (contactId) => {
        get().updateContact(contactId, { isBlocked: false });
      },

      toggleFavorite: (contactId) => {
        const contact = get().contacts.find((c) => c.id === contactId);
        if (contact) {
          get().updateContact(contactId, { isFavorite: !contact.isFavorite });
        }
      },

      createGroup: (name) => {
        const { buddyGroups } = get();
        const newGroup: BuddyGroup = {
          id: `group_${Date.now()}`,
          name,
          order: buddyGroups.length,
          isExpanded: true,
          contactIds: [],
        };
        set({ buddyGroups: [...buddyGroups, newGroup] });
      },

      deleteGroup: (groupId) => {
        set((state) => ({
          buddyGroups: state.buddyGroups.filter((g) => g.id !== groupId),
          contacts: state.contacts.map((c) =>
            c.group === groupId ? { ...c, group: 'other' } : c
          ),
        }));
      },

      renameGroup: (groupId, name) => {
        set((state) => ({
          buddyGroups: state.buddyGroups.map((g) =>
            g.id === groupId ? { ...g, name } : g
          ),
        }));
      },

      toggleGroupExpanded: (groupId) => {
        set((state) => ({
          buddyGroups: state.buddyGroups.map((g) =>
            g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
          ),
        }));
      },

      moveContactToGroup: (contactId, groupId) => {
        get().updateContact(contactId, { group: groupId });
      },

      getOnlineContacts: () => {
        return get().contacts.filter(
          (c) => c.presence.status !== 'offline' && !c.isBlocked
        );
      },

      getOfflineContacts: () => {
        return get().contacts.filter(
          (c) => c.presence.status === 'offline' && !c.isBlocked
        );
      },

      getContactsByGroup: (groupId) => {
        if (groupId === 'favorites') {
          return get().contacts.filter((c) => c.isFavorite && !c.isBlocked);
        }
        return get().contacts.filter((c) => c.group === groupId && !c.isBlocked);
      },

      getContactById: (contactId) => {
        return get().contacts.find((c) => c.id === contactId);
      },
    }),
    {
      name: 'contacts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        buddyGroups: state.buddyGroups,
      }),
    }
  )
);
