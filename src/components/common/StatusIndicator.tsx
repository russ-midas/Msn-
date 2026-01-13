import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { UserStatus } from '../../types';
import { colors, borderRadius } from '../../theme';

interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const statusColors: Record<UserStatus, string> = {
  online: colors.status.online,
  away: colors.status.away,
  busy: colors.status.busy,
  brb: colors.status.away,
  phone: colors.status.busy,
  lunch: colors.status.away,
  invisible: colors.status.invisible,
  offline: colors.status.offline,
};

const sizeMap = {
  small: 8,
  medium: 12,
  large: 16,
};

export function StatusIndicator({ status, size = 'medium', style }: StatusIndicatorProps) {
  const indicatorSize = sizeMap[size];
  const statusColor = statusColors[status];

  return (
    <View
      style={[
        styles.container,
        {
          width: indicatorSize,
          height: indicatorSize,
          borderRadius: indicatorSize / 2,
          backgroundColor: statusColor,
        },
        status === 'online' && styles.onlineGlow,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.ui.surface,
  },
  onlineGlow: {
    shadowColor: colors.status.online,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
