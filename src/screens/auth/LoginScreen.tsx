import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../theme';
import { Input, Button } from '../../components/common';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();
    await login(email, password);
  };

  return (
    <LinearGradient
      colors={colors.gradients.darkSurface}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={colors.gradients.msnHeader}
              style={styles.logoContainer}
            >
              <Ionicons name="chatbubbles" size={48} color={colors.text.primary} />
            </LinearGradient>

            <Text style={styles.title}>Retro Messenger</Text>
            <Text style={styles.subtitle}>Sign in with your account</Text>

            {/* Classic MSN-style tagline */}
            <View style={styles.tagline}>
              <View style={styles.windowButtons}>
                <View style={[styles.windowButton, { backgroundColor: colors.chrome.buttonClose }]} />
                <View style={[styles.windowButton, { backgroundColor: colors.chrome.buttonMinimize }]} />
                <View style={[styles.windowButton, { backgroundColor: colors.chrome.buttonMaximize }]} />
              </View>
              <Text style={styles.taglineText}>Your buddies are waiting!</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.status.busy} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="you@example.com"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password}
              size="large"
              style={styles.loginButton}
            />

            {/* Sign up link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Create one!</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Inspired by MSN Messenger, AIM & ICQ
            </Text>
            <Text style={styles.footerEmoji}>💬 🟢 🌸</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.msn.light,
    shadowColor: colors.msn.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  tagline: {
    backgroundColor: colors.ui.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  windowButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  windowButton: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taglineText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.busy,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.msn.secondary,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  signupText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  signupLink: {
    ...typography.body,
    color: colors.msn.light,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  footerEmoji: {
    fontSize: 20,
    marginTop: spacing.xs,
  },
});
