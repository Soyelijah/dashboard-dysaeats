import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Divider, Button, ActivityIndicator, Chip, Menu, Banner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getOrderById, updateOrderStatus, assignDeliveryPerson } from '../../services/orderService';
import { getAvailableDeliveryPersons } from '../../services/userService';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { useOrderSocket } from '../../hooks/useOrderSocket';
import { OrderStatus } from '../../types/order';
import { theme } from '../../theme';

const OrderDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  
  const [initialOrder, setInitialOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [deliveryMenuVisible, setDeliveryMenuVisible] = useState(false);
  
  // Use the socket hook for real-time updates
  const { order, isConnected, isListening } = useOrderSocket(id, initialOrder);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true);
        const orderData = await getOrderById(id);
        setInitialOrder(orderData);
        
        // Cargar repartidores disponibles
        const deliveryData = await getAvailableDeliveryPersons();
        setDeliveryPersons(deliveryData);
      } catch (error) {
        console.error('Error loading order detail:', error);
        Alert.alert(
          t('orders:errorTitle'),
          t('orders:errorLoading'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigation, t]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!newStatus || newStatus === order.status) return;
    
    try {
      setIsUpdating(true);
      await updateOrderStatus(id, { status: newStatus });
      
      Alert.alert(
        t('orders:statusUpdated'),
        t('orders:statusUpdateSuccess')
      );
      
      // If socket is not connected, update manually
      if (!isConnected) {
        // Recargar la orden
        const updatedOrder = await getOrderById(id);
        setInitialOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        t('orders:errorTitle'),
        t('orders:errorUpdating')
      );
    } finally {
      setIsUpdating(false);
      setStatusMenuVisible(false);
    }
  };

  const handleAssignDelivery = async (deliveryPersonId: string) => {
    if (!deliveryPersonId || deliveryPersonId === order.deliveryPerson?.id) return;
    
    try {
      setIsUpdating(true);
      await assignDeliveryPerson(id, { deliveryPersonId });
      
      Alert.alert(
        t('orders:deliveryAssigned'),
        t('orders:deliveryAssignSuccess')
      );
      
      // If socket is not connected, update manually
      if (!isConnected) {
        // Recargar la orden
        const updatedOrder = await getOrderById(id);
        setInitialOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      Alert.alert(
        t('orders:errorTitle'),
        t('orders:errorAssigning')
      );
    } finally {
      setIsUpdating(false);
      setDeliveryMenuVisible(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isListening && (
        <Banner
          visible={true}
          icon={({ size }) => (
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: isConnected ? theme.colors.success : theme.colors.warning
            }} />
          )}
          actions={[]}
        >
          {isConnected ? 
            t('orders:socket.connected') : 
            t('orders:socket.disconnected')
          }
        </Banner>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orderNumber}>
              {t('orders:orderNumber')} #{order.orderNumber}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()} - {new Date(order.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
            textStyle={styles.statusText}
          >
            {t(`orders:status.${order.status}`)}
          </Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('orders:orderActions')}</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.actionButtons}>
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={
                  <Button 
                    mode="contained"
                    onPress={() => setStatusMenuVisible(true)}
                    disabled={['delivered', 'cancelled', 'rejected'].includes(order.status) || isUpdating}
                    loading={isUpdating}
                    style={styles.actionButton}
                  >
                    {t('orders:updateStatus')}
                  </Button>
                }
              >
                {getValidStatusTransitions(order.status).map((status) => (
                  <Menu.Item
                    key={status}
                    onPress={() => handleStatusChange(status)}
                    title={t(`orders:status.${status}`)}
                  />
                ))}
              </Menu>
              
              <Menu
                visible={deliveryMenuVisible}
                onDismiss={() => setDeliveryMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined"
                    onPress={() => setDeliveryMenuVisible(true)}
                    disabled={['delivered', 'cancelled', 'rejected'].includes(order.status) || isUpdating}
                    loading={isUpdating}
                    style={styles.actionButton}
                  >
                    {t('orders:assignDelivery')}
                  </Button>
                }
              >
                {deliveryPersons.map((person) => (
                  <Menu.Item
                    key={person.id}
                    onPress={() => handleAssignDelivery(person.id)}
                    title={`${person.firstName} ${person.lastName}`}
                  />
                ))}
              </Menu>
            </View>
            
            {order.deliveryPerson && (
              <View style={styles.deliveryPerson}>
                <Text style={styles.sectionTitle}>{t('orders:currentlyAssigned')}:</Text>
                <Text>{order.deliveryPerson.firstName} {order.deliveryPerson.lastName}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('orders:timeline')}</Title>
            <Divider style={styles.divider} />
            <OrderTimeline order={order} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('orders:customerInfo')}</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('orders:name')}:</Text>
              <Text style={styles.infoValue}>{order.customerName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('orders:email')}:</Text>
              <Text style={styles.infoValue}>{order.customerEmail}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('orders:phone')}:</Text>
              <Text style={styles.infoValue}>{order.customerPhone}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>{t('orders:deliveryAddress')}:</Text>
            <Paragraph>{order.deliveryAddress.street}</Paragraph>
            {order.deliveryAddress.unit && <Paragraph>{order.deliveryAddress.unit}</Paragraph>}
            <Paragraph>{order.deliveryAddress.city}, {order.deliveryAddress.state}</Paragraph>
            <Paragraph>{order.deliveryAddress.zipCode}</Paragraph>
            
            {order.deliveryAddress.instructions && (
              <Paragraph style={styles.instructions}>
                {order.deliveryAddress.instructions}
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('orders:orderSummary')}</Title>
            <Divider style={styles.divider} />
            
            {/* Items */}
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.name}
                  </Text>
                  
                  {item.options && Object.keys(item.options).length > 0 && (
                    <View style={styles.itemOptions}>
                      {Object.entries(item.options).map(([key, value]) => (
                        <Text key={key} style={styles.optionText}>
                          {key}: {value.toString()}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {item.notes && (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  )}
                </View>
                
                <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            {/* Totals */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text>{t('orders:subtotal')}</Text>
                <Text>${order.subtotal.toFixed(2)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text>{t('orders:deliveryFee')}</Text>
                <Text>${order.deliveryFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text>{t('orders:tax')}</Text>
                <Text>${order.tax.toFixed(2)}</Text>
              </View>
              
              {order.tip > 0 && (
                <View style={styles.totalRow}>
                  <Text>{t('orders:tip')}</Text>
                  <Text>${order.tip.toFixed(2)}</Text>
                </View>
              )}
              
              <Divider style={styles.totalDivider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.grandTotal}>{t('orders:total')}</Text>
                <Text style={styles.grandTotal}>${order.total.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.paymentMethod}>
              <Text style={styles.infoLabel}>{t('orders:paymentMethod')}:</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helpers
function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: theme.colors.grey,
    confirmed: theme.colors.secondary,
    preparing: theme.colors.warning,
    ready: theme.colors.success,
    in_delivery: theme.colors.info,
    delivered: theme.colors.success,
    cancelled: theme.colors.error,
    rejected: theme.colors.error,
  };
  
  return colors[status] || theme.colors.grey;
}

function getValidStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['in_delivery', 'cancelled'],
    in_delivery: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    rejected: [],
  };
  
  return transitions[currentStatus] || [];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: theme.colors.grey,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deliveryPerson: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '30%',
  },
  infoValue: {
    flex: 1,
  },
  instructions: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemOptions: {
    marginTop: 4,
  },
  optionText: {
    fontSize: 12,
    color: theme.colors.grey,
  },
  itemNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalDivider: {
    marginVertical: 8,
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default OrderDetailScreen;