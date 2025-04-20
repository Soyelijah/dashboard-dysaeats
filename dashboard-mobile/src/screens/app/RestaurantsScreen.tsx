import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState } from '@/store';
import { fetchRestaurants } from '@/store/slices/restaurantsSlice';
import { useTheme } from '@/contexts/ThemeContext';
import Input from '@/components/ui/Input';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  cuisineType: string;
  logo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.restaurantCard, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
    >
      <View style={styles.restaurantHeader}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          {restaurant.logo ? (
            <Image
              source={{ uri: restaurant.logo }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <Icon name="food" size={30} color={colors.primary} />
          )}
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>
            {restaurant.name}
          </Text>
          <Text
            style={[styles.cuisineType, { color: colors.text + '99' }]}
            numberOfLines={1}
          >
            {restaurant.cuisineType}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={[styles.rating, { color: colors.text }]}>
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[styles.address, { color: colors.text + '99' }]}
        numberOfLines={2}
      >
        {restaurant.address}
      </Text>

      <View style={styles.footer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: restaurant.isActive
                ? colors.success + '20'
                : colors.error + '20',
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: restaurant.isActive
                  ? colors.success
                  : colors.error,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: restaurant.isActive ? colors.success : colors.error,
              },
            ]}
          >
            {restaurant.isActive
              ? t('restaurants.active')
              : t('restaurants.inactive')}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.text + '80'} />
      </View>
    </TouchableOpacity>
  );
};

const RestaurantsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const { restaurants, loading } = useSelector(
    (state: RootState) => state.restaurants
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      // @ts-ignore
      await dispatch(fetchRestaurants());
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Apply active only filter
    if (showActiveOnly && !restaurant.isActive) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisineType.toLowerCase().includes(query) ||
        restaurant.address.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnify"
          rightIcon={searchQuery ? 'close' : undefined}
          onRightIconPress={searchQuery ? () => setSearchQuery('') : undefined}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: showActiveOnly ? colors.primary : 'transparent',
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setShowActiveOnly(!showActiveOnly)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: showActiveOnly ? '#FFF' : colors.primary,
              },
            ]}
          >
            {t('restaurants.active')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          contentContainerStyle={styles.restaurantsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="store-off" size={64} color={colors.text + '80'} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {t('restaurants.noRestaurants')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  restaurantsList: {
    paddingBottom: 16,
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
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  restaurantCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cuisineType: {
    fontSize: 14,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RestaurantsScreen;
