import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/contexts/ThemeContext';
import { formatDate } from '@/utils/dateUtils';

import { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onPress?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, compact = false, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'cancelled':
        return 'close-circle';
      case 'in_progress':
        return 'progress-clock';
      default:
        return 'help-circle';
    }
  };

  const handlePress = () => {
    if (typeof onPress === 'function') {
      onPress(order);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.orderId, { color: colors.text }]}>
          {t('orders.order')} #{order.orderNumber || order.id.substring(0, 8)}
        </Text>
        <View style={styles.statusContainer}>
          <Icon
            name={getStatusIcon(order.status)}
            size={16}
            color={getStatusColor(order.status)}
            style={styles.statusIcon}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            {t(`orders.status.${order.status}`)}
          </Text>
        </View>
      </View>

      {!compact && (
        <View style={styles.infoContainer}>
          <Text style={[styles.date, { color: colors.text }]}>
            {formatDate(order.createdAt)}
          </Text>
          <Text style={[styles.price, { color: colors.text }]}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      )}

      {compact ? (
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.text }]}>
            ${order.total.toFixed(2)}
          </Text>
          <Icon name="chevron-right" size={20} color={colors.text} />
        </View>
      ) : (
        <View style={styles.footer}>
          <View style={styles.itemsContainer}>
            <Text style={[styles.itemsLabel, { color: colors.text }]}>
              {t('orders.items')}:
            </Text>
            <Text style={[styles.itemsCount, { color: colors.text }]}>
              {order.items.length}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OrderCard;
