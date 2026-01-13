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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export function SignupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [screenName, setScreenName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSignup = async () => {
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (screenName.length < 3) {
      setLocalError('Screen name must be at least 3 characters');
      return;
    }

    await signup(email, password, screenName);
  };

  const displayError = localError || error;

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
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <LinearGradient
              colors={colors.gradients.msnHeader}
              style={styles.logoContainer}
            >
              <Ionicons name="person-add" size={32} color={colors.text.primary} />
            </LinearGradient>

            <Text style={styles.title}>Join Retro Messenger</Text>
            <Text style={styles.subtitle}>Create your account and start chatting!</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {displayError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.status.busy} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <Input
              label="Screen Name"
              placeholder="xX_CoolUser_Xx"
              leftIcon="at-outline"
              value={screenName}
              onChangeText={setScreenName}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.hint}>
              This is how your buddies will see you! Make it memorable 😎
            </Text>

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
              placeholder="Create a password"
              leftIcon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              disabled={!email || !password || !screenName || !confirmPassword}
              size="large"
              style={styles.signupButton}
            />

            {/* Sign in link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>What you'll get:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color={colors.msn.secondary} />
              <Text style={styles.featureText}>Buddy list with online status</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="hand-left" size={20} color={colors.aim.primary} />
              <Text style={styles.featureText}>Classic nudge feature</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="happy" size={20} color={colors.icq.green} />
              <Text style={styles.featureText}>Custom status messages</Text>
            </View>
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.sm,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.msn.light,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
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
  hint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  signupButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  signinText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  signinLink: {
    ...typography.body,
    color: colors.msn.light,
    fontWeight: '600',
  },
  features: {
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginTop: spacing.xl,
  },
  featuresTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
