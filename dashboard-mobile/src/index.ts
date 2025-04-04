import React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from '../app.json';
import App from './App';
import setupI18n from './lib/i18n';

// Setup internationalization
setupI18n().then(() => {
  // Register the app
  AppRegistry.registerComponent(appName, () => App);
});
