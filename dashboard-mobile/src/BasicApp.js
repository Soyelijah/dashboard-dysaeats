/**
 * Basic React Native App
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const BasicApp = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#F3F3F3',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.mainContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>DysaEats</Text>
          <Text style={styles.subtitle}>Plataforma de entrega de comida</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.info}>Versión 1.0.0</Text>
          <Text style={styles.info}>© 2025 DYSA Solutions</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6347', // Tomato color
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  info: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
});

export default BasicApp;