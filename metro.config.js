const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for web compatibility
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add alias for platform utilities
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native': 'react-native-web',
};

// Configure transformer for web
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;

