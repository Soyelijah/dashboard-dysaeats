import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/contexts/ThemeContext';

import HomeScreen from '@/screens/app/HomeScreen';
import OrdersScreen from '@/screens/app/OrdersScreen';
import OrderDetailScreen from '@/screens/orders/OrderDetailScreen';
import RestaurantsScreen from '@/screens/app/RestaurantsScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';

// Define the type for the stack navigator params
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { id: string; orderNumber?: string };
};

export type RestaurantsStackParamList = {
  RestaurantsList: undefined;
  RestaurantDetail: { id: string };
};

// Define the type for the tab navigator params
export type AppTabParamList = {
  Home: undefined;
  OrdersStack: undefined;
  RestaurantsStack: undefined;
  Profile: undefined;
};

const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const RestaurantsStack = createNativeStackNavigator<RestaurantsStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Orders Stack Navigator
const OrdersStackNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{ title: t('orders.title'), headerShown: false }}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={({ route }) => ({
          title: `${t('orders.orderNumber')} #${route.params?.orderNumber || route.params.id.substring(0, 8)}`,
        })}
      />
    </OrdersStack.Navigator>
  );
};

// Restaurants Stack Navigator
const RestaurantsStackNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <RestaurantsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <RestaurantsStack.Screen
        name="RestaurantsList"
        component={RestaurantsScreen}
        options={{ title: t('restaurants.all'), headerShown: false }}
      />
    </RestaurantsStack.Navigator>
  );
};

// Main Tab Navigator
const AppNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OrdersStack') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
          } else if (route.name === 'RestaurantsStack') {
            iconName = focused ? 'store' : 'store-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: colors.border,
        },
        headerTintColor: colors.text,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen
        name="OrdersStack"
        component={OrdersStackNavigator}
        options={{ title: t('navigation.orders') }}
      />
      <Tab.Screen
        name="RestaurantsStack"
        component={RestaurantsStackNavigator}
        options={{ title: t('navigation.restaurants') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;