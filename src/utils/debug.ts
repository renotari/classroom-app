/**
 * Debug Logging Utility
 *
 * Provides conditional logging based on DEBUG environment variable.
 * In production builds, console statements are stripped out for performance.
 *
 * Usage:
 *   import { debug } from '@/utils/debug';
 *   debug.log('[Component]', 'Message', data);
 *   debug.warn('[Service]', 'Warning message');
 *   debug.error('[Error]', 'Error occurred', error);
 */

const IS_DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

export const debug = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: unknown[]): void => {
    if (IS_DEBUG) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: unknown[]): void => {
    if (IS_DEBUG) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always logged, even in production)
   * Errors should always be visible for debugging issues
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Check if debug mode is enabled
   */
  isEnabled: (): boolean => IS_DEBUG,
};

/**
 * Alternative: Direct conditional logging
 * Use this for performance-critical code where function call overhead matters
 */
export const DEBUG = IS_DEBUG;
