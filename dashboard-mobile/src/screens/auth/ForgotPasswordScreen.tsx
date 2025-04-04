import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const forgotPasswordSchema = z.object({
  email: z.string().email('invalidEmail'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Here you would dispatch a forgot password action
      console.log('Forgot password data:', data);
      
      // Reset form and show success message or navigate to Login
      reset();
      
      // Navigate to Login after 2 seconds (simulating success)
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      console.error('Forgot password request failed:', error);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('auth.forgotPassword.resetPassword')}
        </Text>
        <Text style={[styles.instruction, { color: colors.text }]}>
          {t('auth.forgotPassword.instruction')}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.forgotPassword.email')}
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email ? t(`auth.errors.${errors.email.message}`) : undefined}
            />
          )}
        />

        <Button
          title={t('auth.forgotPassword.resetButton')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          containerStyle={styles.resetButton}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={styles.backToLoginContainer}
        >
          <Text style={[styles.backToLoginText, { color: colors.primary }]}>
            {t('auth.forgotPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    marginTop: 16,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
