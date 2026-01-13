import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';

interface RetroHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  gradient?: string[];
  style?: ViewStyle;
}

export function RetroHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  gradient = colors.gradients.msnHeader,
  style,
}: RetroHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + spacing.sm }, style]}
    >
      {/* Classic window buttons decoration */}
      <View style={styles.windowButtons}>
        <View style={[styles.windowButton, styles.closeButton]} />
        <View style={[styles.windowButton, styles.minimizeButton]} />
        <View style={[styles.windowButton, styles.maximizeButton]} />
      </View>

      <View style={styles.content}>
        {/* Left section */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center section */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              <Ionicons name={rightIcon} size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.chrome.windowBorder,
  },
  windowButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    gap: 6,
  },
  windowButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeButton: {
    backgroundColor: colors.chrome.buttonClose,
  },
  minimizeButton: {
    backgroundColor: colors.chrome.buttonMinimize,
  },
  maximizeButton: {
    backgroundColor: colors.chrome.buttonMaximize,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  rightButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
