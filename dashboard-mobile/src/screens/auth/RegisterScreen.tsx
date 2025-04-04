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

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const registerSchema = z.object({
  name: z.string().min(1, 'nameRequired'),
  email: z.string().email('invalidEmail'),
  password: z.string().min(6, 'passwordLength'),
  confirmPassword: z.string().min(1, 'passwordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Here you would dispatch a register action
      console.log('Register data:', data);
      
      // Navigate to login after successful registration
      navigation.navigate('Login');
    } catch (error) {
      console.error('Registration failed:', error);
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
          {t('auth.register.createAccount')}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.name')}
              placeholder={t('auth.register.namePlaceholder')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name ? t(`auth.errors.${errors.name.message}`) : undefined}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.email')}
              placeholder={t('auth.register.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email ? t(`auth.errors.${errors.email.message}`) : undefined}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.password')}
              placeholder={t('auth.register.passwordPlaceholder')}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password ? t(`auth.errors.${errors.password.message}`) : undefined}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.confirmPassword')}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword ? t(`auth.errors.${errors.confirmPassword.message}`) : undefined}
            />
          )}
        />

        <Button
          title={t('auth.register.registerButton')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          containerStyle={styles.registerButton}
        />

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            {t('auth.register.alreadyHaveAccount')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              {t('auth.register.login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen;
