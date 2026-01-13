import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.container, sizeStyles[size], isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={isDisabled ? [colors.text.muted, colors.text.muted] : colors.gradients.msnHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.text, textSizeStyles[size], textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
  };

  const textVariantStyles = {
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    ghost: styles.textGhost,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.text.primary : colors.msn.secondary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              textVariantStyles[variant],
              textSizeStyles[size],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  gradient: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sizeSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sizeMedium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sizeLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  secondary: {
    backgroundColor: colors.ui.surfaceLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.msn.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    color: colors.text.primary,
  },
  textSmall: {
    ...typography.buttonSmall,
  },
  textMedium: {
    ...typography.button,
  },
  textLarge: {
    ...typography.button,
    fontSize: 18,
  },
  textSecondary: {
    color: colors.text.primary,
  },
  textOutline: {
    color: colors.msn.secondary,
  },
  textGhost: {
    color: colors.msn.secondary,
  },
  textDisabled: {
    color: colors.text.muted,
  },
});
