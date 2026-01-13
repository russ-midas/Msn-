# Retro Messenger

A modern messaging app for iOS and Android inspired by the classic instant messengers - MSN Messenger, AIM, and ICQ.

## Features

### Classic Messaging Experience
- **Buddy List** - Organize your contacts in groups with expandable sections
- **Presence Indicators** - See who's online, away, busy, or offline
- **Custom Status Messages** - Set personalized status messages like the good old days
- **Nudge/Buzz** - Send a nudge to get someone's attention (with haptic feedback!)

### Status Options
- Online, Away, Busy, Be Right Back
- On the Phone, Out to Lunch
- Invisible mode

### Modern Features
- Real-time messaging with delivery/read receipts
- Pin and mute conversations
- Group chats
- Dark theme with retro color schemes

### Themes
- **MSN** - Classic green gradient
- **AIM** - Yellow/orange running man vibes
- **ICQ** - Green flower nostalgia
- **Modern** - Clean dark mode

## Tech Stack

- **React Native** with **Expo** for cross-platform iOS/Android
- **TypeScript** for type safety
- **Zustand** for state management
- **React Navigation** for navigation
- **Expo Linear Gradient** for classic gradient effects
- **Expo Haptics** for tactile feedback
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Project Structure

```
src/
├── components/
│   └── common/          # Reusable UI components
│       ├── Avatar.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── RetroHeader.tsx
│       └── StatusIndicator.tsx
├── navigation/          # Navigation configuration
├── screens/
│   ├── auth/           # Login & Signup screens
│   └── main/           # Main app screens
│       ├── ChatScreen.tsx
│       ├── ContactsScreen.tsx
│       ├── ConversationsScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── SettingsScreen.tsx
│       └── StatusScreen.tsx
├── stores/             # Zustand state stores
│   ├── authStore.ts
│   ├── contactsStore.ts
│   ├── messagesStore.ts
│   └── settingsStore.ts
├── theme/              # Design tokens
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
└── types/              # TypeScript definitions
```

## Roadmap

- [ ] Backend integration with WebSocket support
- [ ] Push notifications
- [ ] Image/file sharing
- [ ] Voice messages
- [ ] Classic emoticon packs
- [ ] Winks (animated messages)
- [ ] Sound effects (door open/close, message received)
- [ ] Display picture customization
- [ ] End-to-end encryption

## Screenshots

*Coming soon*

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

---

*Made with 💚 and nostalgia for the golden age of instant messaging*
