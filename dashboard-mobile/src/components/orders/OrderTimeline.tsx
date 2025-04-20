import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../../types/order';
import { theme } from '../../theme';

interface OrderTimelineProps {
  order: any;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const { t } = useTranslation();
  
  const events = [
    {
      id: 'created',
      status: 'pending',
      icon: 'clock-outline',
      title: t('orders:status.placed'),
      timestamp: order.createdAt,
      completed: true,
    },
    {
      id: 'accepted',
      status: 'confirmed',
      icon: 'check-circle-outline',
      title: t('orders:status.confirmed'),
      timestamp: order.acceptedAt,
      completed: !!order.acceptedAt,
    },
    {
      id: 'preparing',
      status: 'preparing',
      icon: 'stove',
      title: t('orders:status.preparing'),
      timestamp: order.preparingAt,
      completed: !!order.preparingAt,
    },
    {
      id: 'ready',
      status: 'ready',
      icon: 'food',
      title: t('orders:status.ready'),
      timestamp: order.readyAt,
      completed: !!order.readyAt,
    },
    {
      id: 'delivery',
      status: 'in_delivery',
      icon: 'truck-delivery-outline',
      title: t('orders:status.in_delivery'),
      timestamp: order.inDeliveryAt,
      completed: !!order.inDeliveryAt,
    },
    {
      id: 'delivered',
      status: 'delivered',
      icon: 'check-circle',
      title: t('orders:status.delivered'),
      timestamp: order.deliveredAt,
      completed: !!order.deliveredAt,
    }
  ];

  // Handle cancelled or rejected orders
  if (order.status === 'cancelled' || order.status === 'rejected') {
    events.push({
      id: 'cancelled_or_rejected',
      status: order.status as OrderStatus,
      icon: 'close-circle',
      title: order.status === 'cancelled' 
        ? t('orders:status.cancelled') 
        : t('orders:status.rejected'),
      timestamp: order.cancelledAt || order.rejectedAt,
      completed: true,
    });
  }

  // Filter events that are relevant to this order's journey
  const relevantEvents = events.filter(event => {
    // Always show created event
    if (event.id === 'created') return true;
    
    // Always show cancelled/rejected if that's the status
    if (event.id === 'cancelled_or_rejected' && (order.status === 'cancelled' || order.status === 'rejected')) return true;
    
    // For other events, only show if we've reached or passed this status
    const statusIndex = events.findIndex(e => e.status === order.status);
    const eventIndex = events.findIndex(e => e.id === event.id);
    
    return eventIndex <= statusIndex;
  });

  return (
    <View style={styles.container}>
      {relevantEvents.map((event, index) => (
        <View key={event.id} style={styles.eventContainer}>
          <View style={styles.iconContainer}>
            <Icon 
              name={event.icon} 
              size={24}
              color={event.completed ? theme.colors.primary : theme.colors.grey}
              style={styles.icon}
            />
            {index < relevantEvents.length - 1 && (
              <View 
                style={[
                  styles.line, 
                  { backgroundColor: relevantEvents[index + 1].completed ? theme.colors.primary : theme.colors.grey }
                ]} 
              />
            )}
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{event.title}</Text>
            {event.timestamp ? (
              <Text style={styles.timestamp}>
                {new Date(event.timestamp).toLocaleDateString()} - {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
            ) : (
              <Text style={styles.pending}>{t('orders:pending')}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  eventContainer: {
    flexDirection: 'row',
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  icon: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
  },
  line: {
    position: 'absolute',
    top: 32,
    width: 2,
    height: '100%',
    backgroundColor: theme.colors.grey,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: theme.colors.grey,
  },
  pending: {
    fontSize: 14,
    color: theme.colors.grey,
    fontStyle: 'italic',
  },
});

export default OrderTimeline;