import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { getOrders } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { theme } from '../../theme';
import { OrderStatus } from '../../types/order';

const OrdersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  const fetchOrders = async (loadMore = false) => {
    try {
      const newPage = loadMore ? pagination.page + 1 : 1;
      
      if (!loadMore) setIsLoading(true);
      
      const { data, total } = await getOrders({
        page: newPage,
        limit: pagination.limit,
        status: filter !== 'all' ? filter as OrderStatus : undefined,
        search: searchQuery || undefined,
      });
      
      setOrders(loadMore ? [...orders, ...data] : data);
      setPagination({
        ...pagination,
        page: newPage,
        total,
        hasMore: data.length === pagination.limit,
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleSearch = () => {
    fetchOrders();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleLoadMore = () => {
    fetchOrders(true);
  };

  const renderFooter = () => {
    if (!pagination.hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
      </View>
    );
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', {
      id: order.id,
      orderNumber: order.orderNumber
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('orders:title')}</Text>
        <Searchbar
          placeholder={t('orders:searchPlaceholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: t('orders:all') },
            { key: 'pending', label: t('orders:status.pending') },
            { key: 'confirmed', label: t('orders:status.confirmed') },
            { key: 'preparing', label: t('orders:status.preparing') },
            { key: 'ready', label: t('orders:status.ready') },
            { key: 'in_delivery', label: t('orders:status.in_delivery') },
            { key: 'delivered', label: t('orders:status.delivered') },
          ]}
          renderItem={({ item }) => (
            <Chip
              selected={filter === item.key}
              onPress={() => setFilter(item.key as OrderStatus | 'all')}
              style={styles.filterChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      <Divider />

      {isLoading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => handleOrderPress(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('orders:noOrders')}</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: theme.colors.surfaceVariant,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.grey,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default OrdersScreen;