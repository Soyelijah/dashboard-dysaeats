import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import i18n from '../../lib/i18n';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

import { RootState } from '@/store';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { fetchRestaurants } from '@/store/slices/restaurantsSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { useSocket } from '@/contexts/SocketContext';
import OrderCard from '@/components/orders/OrderCard';
import StatsCard from '@/components/dashboard/StatsCard';

const HomeScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { isConnected } = useSocket();
  
  // t function can be replaced with i18n.t
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.orders);
  const { restaurants, loading: restaurantsLoading } = useSelector(
    (state: RootState) => state.restaurants
  );

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // @ts-ignore
      await Promise.all([dispatch(fetchOrders()), dispatch(fetchRestaurants())]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentOrders = orders.slice(0, 5);

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const completedOrders = orders.filter((order) => order.status === 'completed').length;
  const totalRevenue = orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {i18n.t('common.welcome', { name: user?.name })}
        </Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isConnected ? colors.success : colors.error },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isConnected
              ? i18n.t('common.connected')
              : i18n.t('common.disconnected')}
          </Text>
        </View>
        <LanguageSwitcher style={styles.languageSwitcher} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {i18n.t('dashboard.summary')}
      </Text>

      <View style={styles.statsContainer}>
        <StatsCard
          title={i18n.t('orders.orders')}
          value={totalOrders.toString()}
          icon="receipt"
          backgroundColor={colors.primary}
        />
        <StatsCard
          title={i18n.t('orders.pending')}
          value={pendingOrders.toString()}
          icon="clock-outline"
          backgroundColor={colors.warning}
        />
        <StatsCard
          title={i18n.t('orders.delivered')}
          value={completedOrders.toString()}
          icon="check-circle-outline"
          backgroundColor={colors.success}
        />
        <StatsCard
          title={i18n.t('orders.total')}
          value={`$${totalRevenue.toFixed(2)}`}
          icon="cash"
          backgroundColor={colors.secondary}
        />
      </View>

      <View style={styles.recentOrdersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('dashboard.recentOrders')}
        </Text>

        {ordersLoading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {i18n.t('common.loading')}
          </Text>
        ) : recentOrders.length > 0 ? (
          <View style={styles.ordersGrid}>
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {i18n.t('dashboard.noData')}
          </Text>
        )}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageSwitcher: {
    marginLeft: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  recentOrdersContainer: {
    marginBottom: 16,
  },
  ordersGrid: {
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default HomeScreen;
