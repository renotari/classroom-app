/**
 * Storage Service
 *
 * Abstraction layer for localStorage operations.
 * Provides type-safe, error-handling wrapper around localStorage.
 *
 * Benefits:
 * - Centralized localStorage access
 * - Type safety with generics
 * - Error handling
 * - Serialization/deserialization
 * - Future migration path (e.g., to IndexedDB, sessionStorage)
 */

/**
 * Error types for storage operations
 */
export class StorageError extends Error {
  constructor(
    public code: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'NOT_FOUND' | 'SERIALIZATION_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Get a value from localStorage with type safety
 *
 * @param key - Storage key
 * @param defaultValue - Default value if key not found
 * @returns Parsed value or default
 * @throws StorageError if parsing fails
 *
 * @example
 * const config = getItem('app-config', {theme: 'dark'})
 */
export function getItem<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new StorageError(
        'PARSE_ERROR',
        `Failed to parse stored value for key "${key}": ${error.message}`
      );
    }

    throw error;
  }
}

/**
 * Set a value in localStorage with type safety
 *
 * @param key - Storage key
 * @param value - Value to store (must be JSON serializable)
 * @throws StorageError if quota exceeded or serialization fails
 *
 * @example
 * setItem('app-config', {theme: 'dark'})
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError(
        'QUOTA_EXCEEDED',
        `localStorage quota exceeded. Cannot store key "${key}"`
      );
    }

    if (error instanceof TypeError) {
      throw new StorageError(
        'SERIALIZATION_ERROR',
        `Value for key "${key}" is not JSON serializable: ${error.message}`
      );
    }

    throw error;
  }
}

/**
 * Remove a value from localStorage
 *
 * @param key - Storage key
 *
 * @example
 * removeItem('app-config')
 */
export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Clear all stored values
 *
 * @example
 * clear() // Warning: removes ALL stored data
 */
export function clear(): void {
  localStorage.clear();
}

/**
 * Check if a key exists in localStorage
 *
 * @param key - Storage key
 * @returns true if key exists
 *
 * @example
 * hasItem('app-config') // true or false
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * Get all stored keys
 *
 * @returns Array of storage keys
 *
 * @example
 * getAllKeys() // ['app-config', 'user-preferences', ...]
 */
export function getAllKeys(): string[] {
  return Object.keys(localStorage);
}

/**
 * Get storage size in bytes (approximate)
 *
 * @returns Total size in bytes
 *
 * @example
 * getStorageSize() // 12345
 */
export function getStorageSize(): number {
  let totalSize = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
  }

  return totalSize;
}

/**
 * Store with expiration time
 *
 * @param key - Storage key
 * @param value - Value to store
 * @param expirationMs - Expiration time in milliseconds from now
 *
 * @example
 * setItemWithExpiry('temp-data', {data: 'test'}, 3600000) // 1 hour
 */
export function setItemWithExpiry<T>(key: string, value: T, expirationMs: number): void {
  const item = {
    value,
    expiry: Date.now() + expirationMs,
  };

  setItem(key, item);
}

/**
 * Get item with expiration check
 *
 * @param key - Storage key
 * @param defaultValue - Default value if expired or not found
 * @returns Value if exists and not expired, otherwise default
 *
 * @example
 * const data = getItemWithExpiry('temp-data', null)
 */
export function getItemWithExpiry<T>(
  key: string,
  defaultValue?: T
): T | undefined {
  try {
    const item = getItem<{ value: T; expiry: number }>(key);

    if (!item) {
      return defaultValue;
    }

    if (Date.now() > item.expiry) {
      removeItem(key);
      return defaultValue;
    }

    return item.value;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If parsing fails, return default
    return defaultValue;
  }
}

/**
 * Export all storage as JSON (for debugging)
 *
 * @returns Object containing all stored key-value pairs
 *
 * @example
 * const backup = exportAll()
 */
export function exportAll(): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value; // Store as string if not JSON
        }
      }
    }
  }

  return result;
}

/**
 * Import storage from JSON
 *
 * @param data - Object with key-value pairs to import
 * @param replace - Whether to clear existing data first
 *
 * @example
 * importAll({theme: 'dark'}, false) // merge mode
 */
export function importAll(data: Record<string, unknown>, replace: boolean = false): void {
  if (replace) {
    clear();
  }

  for (const [key, value] of Object.entries(data)) {
    setItem(key, value);
  }
}
