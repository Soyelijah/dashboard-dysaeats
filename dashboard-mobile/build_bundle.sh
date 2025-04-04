#\!/bin/bash
# Script para generar el bundle de JavaScript

# Configuraciones
export PATH=/Users/devlmer/.nvm/versions/node/v22.14.0/bin:$PATH
export TMPDIR=/tmp
mkdir -p $TMPDIR
chmod 777 $TMPDIR
ulimit -n 65536

# Crear directorio para el bundle
mkdir -p android/app/src/main/assets

# Generar código básico para el bundle
echo "
// Basic React Native App
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>DysaEats</Text>
        <Text style={styles.subtitle}>Bienvenido a la aplicación</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default App;
" > src/SimpleApp.js

# Crear un index simplificado
echo "
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/SimpleApp';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
" > index.simple.js

# Generar bundle usando el index simplificado
BUNDLE_FILE=android/app/src/main/assets/index.android.bundle
ASSETS_DEST=android/app/src/main/res

echo "Generando bundle de JavaScript..."
node ./node_modules/@react-native-community/cli/build/bin.js bundle \
  --platform android \
  --dev false \
  --reset-cache \
  --entry-file index.simple.js \
  --bundle-output $BUNDLE_FILE \
  --assets-dest $ASSETS_DEST \
  --max-workers 1

if [ $? -eq 0 ]; then
  echo "Bundle generado correctamente: $BUNDLE_FILE"
else
  echo "Error generando bundle"
  exit 1
fi
