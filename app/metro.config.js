const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Configuration optimizations for older MacBooks and EMFILE fix
const config = {
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  watcher: {
    additionalExts: [], // Reduce file types being watched
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 10000,
    },
  },
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add headers for better caching on older devices
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return middleware(req, res, next);
      };
    },
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    // Reduce the number of files Metro watches
    blacklistRE: /node_modules\/.*\/(android|ios)\/.*|.*\/__tests__\/.*|\.git\/.*/,
  },
};

module.exports = mergeConfig(defaultConfig, config);
