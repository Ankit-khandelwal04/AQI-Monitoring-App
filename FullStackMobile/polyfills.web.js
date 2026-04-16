/**
 * Web polyfills for React Native modules that don't exist on web
 */

// Polyfill for React Native DevTools that doesn't exist on web
if (typeof window !== 'undefined') {
  // Mock the React DevTools setup to prevent errors
  try {
    // This prevents the error from React Native's setUpReactDevTools
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      supportsFiber: true,
      renderers: new Map(),
    };
  } catch (e) {
    console.warn('DevTools polyfill failed:', e);
  }
}
