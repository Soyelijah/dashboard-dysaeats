import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="AppNavigator" component={AppNavigator} />
      ) : (
        <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
