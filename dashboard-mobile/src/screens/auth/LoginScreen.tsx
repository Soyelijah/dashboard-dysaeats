import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { login } from '@/store/slices/authSlice';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // @ts-ignore
      await dispatch(login(data)).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
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
          {t('auth.login.welcome')}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.login.email')}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.login.password')}
              placeholder={t('auth.login.passwordPlaceholder')}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordContainer}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            {t('auth.login.forgotPassword')}
          </Text>
        </TouchableOpacity>

        <Button
          title={t('auth.login.loginButton')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          containerStyle={styles.loginButton}
        />

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.text }]}>
            {t('auth.login.noAccount')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              {t('auth.login.register')}
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;
