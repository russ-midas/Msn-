# Retro Messenger

A modern messaging app for iOS and Android inspired by the classic instant messengers - MSN Messenger, AIM, and ICQ. Features an **ephemeral presence system** that makes online status meaningful again.

## Ephemeral Presence System

Unlike modern messengers where everyone is always "available", Retro Messenger brings back meaningful presence:

| Status | When | What You Can Do |
|--------|------|-----------------|
| **Online** | App is open | Send messages |
| **Away** | App is backgrounded | Send a nudge |
| **Offline** | Away for 10+ minutes | Send ONE nudge per 24 hours |

This creates intentional, meaningful interactions:
- **Want to chat?** They need to be online
- **Need their attention?** Send a nudge when they're away
- **Haven't heard from them?** One daily nudge to let them know you're thinking of them

## Features

### Classic Messaging Experience
- **Buddy List** - Organize your contacts in groups with expandable sections
- **Presence Indicators** - See who's online, away, busy, or offline
- **Custom Status Messages** - Set personalized status messages like the good old days
- **Nudge/Buzz** - Send a nudge to get someone's attention (with haptic feedback!)

### Status Options
- Online (automatic when app is open)
- Away (automatic when backgrounded)
- Offline (automatic after 10 min away)

### Interaction Rules
- **Message** online users freely
- **Nudge** away users to get their attention
- **Nudge once per 24h** offline users - make it count!

### Modern Features
- Real-time messaging with delivery/read receipts
- Pin and mute conversations
- Group chats
- Dark theme with retro color schemes
- Haptic feedback for nudges

### Themes
- **MSN** - Classic green gradient
- **AIM** - Yellow/orange running man vibes
- **ICQ** - Green flower nostalgia
- **Modern** - Clean dark mode

## Tech Stack

- **React Native** with **Expo** for cross-platform iOS/Android
- **TypeScript** for type safety
- **Zustand** for state management (with persistence)
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
├── services/
│   └── presenceService.ts  # Ephemeral presence management
├── stores/             # Zustand state stores
│   ├── authStore.ts
│   ├── contactsStore.ts
│   ├── messagesStore.ts
│   ├── nudgeStore.ts   # Nudge cooldown tracking
│   └── settingsStore.ts
├── theme/              # Design tokens
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
└── types/              # TypeScript definitions
```

## How Presence Works

```
┌─────────────────────────────────────────────────────────┐
│                    App State Flow                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  App Opens ──► ONLINE ──► Can receive messages          │
│       │                                                  │
│       ▼                                                  │
│  App Backgrounds ──► AWAY ──► Can receive nudges        │
│       │                                                  │
│       ▼ (after 10 min)                                  │
│  Still Backgrounded ──► OFFLINE ──► 1 nudge/24h         │
│       │                                                  │
│       ▼                                                  │
│  App Opens Again ──► Back to ONLINE                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Roadmap

- [ ] Backend integration with WebSocket support
- [ ] Push notifications (wake up when nudged!)
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
