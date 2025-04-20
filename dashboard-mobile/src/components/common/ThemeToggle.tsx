import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  useColorScheme 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ThemeOption {
  key: 'light' | 'dark' | 'system';
  label: string;
  icon: string;
}

const themeOptions: ThemeOption[] = [
  { key: 'light', label: 'Claro', icon: 'white-balance-sunny' },
  { key: 'dark', label: 'Oscuro', icon: 'moon-waning-crescent' },
  { key: 'system', label: 'Sistema', icon: 'theme-light-dark' },
];

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, colors, isDark } = useTheme();
  const systemTheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  const getActiveTheme = () => {
    const currentOption = themeOptions.find(option => option.key === theme);
    return currentOption || themeOptions[0];
  };

  const renderThemeOption = ({ item }: { item: ThemeOption }) => {
    const isActive = item.key === theme;
    
    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          {
            backgroundColor: isActive 
              ? colors.primary + '20' // 20% opacity
              : 'transparent',
          }
        ]}
        onPress={() => {
          setTheme(item.key);
          setModalVisible(false);
        }}
      >
        <Icon 
          name={item.icon} 
          size={24} 
          color={isActive ? colors.primary : colors.text} 
        />
        <Text 
          style={[
            styles.optionText, 
            { 
              color: isActive ? colors.primary : colors.text,
              fontWeight: isActive ? '600' : 'normal',
            }
          ]}
        >
          {item.label}
        </Text>
        {isActive && (
          <Icon 
            name="check" 
            size={20} 
            color={colors.primary} 
            style={styles.checkIcon} 
          />
        )}
      </TouchableOpacity>
    );
  };

  const activeTheme = getActiveTheme();

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.themeButton,
          { backgroundColor: isDark ? colors.surface : colors.background }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Icon name={activeTheme.icon} size={20} color={colors.text} />
        <Text style={[styles.themeText, { color: colors.text }]}>
          {activeTheme.label}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { 
                backgroundColor: colors.surface,
                ...isDark 
                  ? { borderColor: 'rgba(255, 255, 255, 0.1)' }
                  : { borderColor: 'rgba(0, 0, 0, 0.1)' }
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Seleccionar tema
            </Text>
            <FlatList
              data={themeOptions}
              renderItem={renderThemeOption}
              keyExtractor={(item) => item.key}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  themeText: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});

export default ThemeToggle;