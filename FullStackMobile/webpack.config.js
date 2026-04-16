const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@react-navigation', 'nativewind'],
      },
    },
    argv
  );

  // Suppress all warnings
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /export .* was not found in/,
    /Module not found/,
    /Can't resolve/,
  ];

  // Disable source-map-loader for node_modules
  config.module.rules = config.module.rules.map(rule => {
    if (rule.loader && rule.loader.includes('source-map-loader')) {
      return {
        ...rule,
        exclude: /node_modules/,
      };
    }
    return rule;
  });

  // Comprehensive list of React Native modules to ignore on web
  const reactNativeModulesToIgnore = [
    'ReactDevToolsSettingsManager',
    'setUpReactDevTools',
    'RCTAlertManager',
    'PlatformColorValueTypes',
  ];

  // Add IgnorePlugin for each problematic module
  reactNativeModulesToIgnore.forEach(moduleName => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: new RegExp(moduleName),
      })
    );
  });

  // Ignore specific React Native Core modules
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/setUpReactDevTools$/,
      contextRegExp: /react-native\/Libraries\/Core/,
    })
  );

  // Add resolve aliases to prevent module resolution errors
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native/Libraries/Core/setUpReactDevTools': false,
    'react-native/Libraries/Alert/RCTAlertManager': false,
    'react-native/Libraries/StyleSheet/PlatformColorValueTypes': false,
    // Use web-compatible MapView
    'react-native-maps': path.resolve(__dirname, 'src/components/MapView.web.tsx'),
    // Use web-compatible DateTimePicker
    '@react-native-community/datetimepicker': path.resolve(__dirname, 'src/components/DateTimePicker.web.tsx'),
  };

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native': false,
  };

  return config;
};
