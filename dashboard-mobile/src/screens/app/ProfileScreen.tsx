import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { changeLanguage } from '@/lib/i18n';
import Button from '@/components/ui/Button';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { theme, colors, setTheme, isDark } = useTheme();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleChangeLanguage = async (language: string) => {
    setSelectedLanguage(language);
    await changeLanguage(language);
  };

  const handleChangeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    Alert.alert(
      t('profile.logout'),
      t('common.areYouSure'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              // @ts-ignore
              await dispatch(logout()).unwrap();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSectionTitle = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );

  const renderProfileItem = (icon: string, label: string, value: string) => (
    <View style={[styles.profileItem, { borderBottomColor: colors.border }]}>
      <View style={styles.profileItemLeft}>
        <Icon name={icon} size={22} color={colors.primary} style={styles.itemIcon} />
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.itemValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const renderThemeOption = (value: 'light' | 'dark' | 'system', label: string) => (
    <TouchableOpacity
      style={[styles.radioOption, { borderBottomColor: colors.border }]}
      onPress={() => handleChangeTheme(value)}
    >
      <View style={styles.radioOptionLeft}>
        <View
          style={[
            styles.radioButton,
            {
              borderColor: colors.primary,
              backgroundColor: theme === value ? colors.primary : 'transparent',
            },
          ]}
        />
        <Text style={[styles.radioLabel, { color: colors.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLanguageOption = (value: string, label: string) => (
    <TouchableOpacity
      style={[styles.radioOption, { borderBottomColor: colors.border }]}
      onPress={() => handleChangeLanguage(value)}
    >
      <View style={styles.radioOptionLeft}>
        <View
          style={[
            styles.radioButton,
            {
              borderColor: colors.primary,
              backgroundColor:
                selectedLanguage === value ? colors.primary : 'transparent',
            },
          ]}
        />
        <Text style={[styles.radioLabel, { color: colors.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: colors.primary + '30' },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.text + 'AA' }]}>
          {user?.email}
        </Text>
        <Text style={[styles.userRole, { color: colors.primary }]}>
          {user?.role}
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionTitle(t('profile.personalInfo'))}

        {renderProfileItem(
          'account',
          t('profile.name'),
          user?.name || 'N/A'
        )}
        {renderProfileItem(
          'email',
          t('profile.email'),
          user?.email || 'N/A'
        )}
        {renderProfileItem(
          'phone',
          t('profile.phone'),
          user?.phone || 'N/A'
        )}
        {renderProfileItem(
          'badge-account',
          t('profile.role'),
          user?.role || 'N/A'
        )}
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionTitle(t('profile.theme.title'))}
        {renderThemeOption('light', t('profile.theme.light'))}
        {renderThemeOption('dark', t('profile.theme.dark'))}
        {renderThemeOption('system', t('profile.theme.system'))}
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionTitle(t('profile.language'))}
        {renderLanguageOption('en', 'English')}
        {renderLanguageOption('es', 'Español')}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('profile.logout')}
          onPress={handleLogout}
          type="outline"
          containerStyle={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
  },
  radioOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  radioOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default ProfileScreen;
