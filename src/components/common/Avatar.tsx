import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, iconSizes, borderRadius } from '../../theme';
import { UserStatus } from '../../types';
import { StatusIndicator } from './StatusIndicator';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  status?: UserStatus;
  showStatus?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  small: 40,
  medium: iconSizes.avatar,
  large: iconSizes.avatarLarge,
};

const fontSizeMap = {
  small: 14,
  medium: 20,
  large: 28,
};

// Generate consistent color from name
function getGradientFromName(name: string): string[] {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    colors.gradients.msnHeader,
    colors.gradients.aimHeader,
    colors.gradients.icqHeader,
    colors.gradients.online,
    colors.gradients.away,
    ['#9C27B0', '#673AB7'],
    ['#2196F3', '#03A9F4'],
    ['#FF5722', '#FF9800'],
  ];
  return gradients[hash % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  uri,
  name,
  size = 'medium',
  status,
  showStatus = true,
  style,
}: AvatarProps) {
  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const statusSize = size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium';

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      ) : (
        <LinearGradient
          colors={getGradientFromName(name)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.placeholder,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </LinearGradient>
      )}

      {showStatus && status && (
        <View style={[styles.statusContainer, { bottom: 0, right: 0 }]}>
          <StatusIndicator status={status} size={statusSize} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  initials: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statusContainer: {
    position: 'absolute',
  },
});
