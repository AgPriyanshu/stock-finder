/**
 * LocalStorageManager - Centralized localStorage access manager
 * Provides type-safe methods for storing and retrieving data from localStorage
 */

export class LocalStorageManager {
  /**
   * Get an item from localStorage
   */
  static getItem<T = string>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;

      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set an item in localStorage
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
    }
  }

  /**
   * Remove an item from localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }

  /**
   * Check if a key exists in localStorage
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  static getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error("Error getting all keys from localStorage", error);
      return [];
    }
  }
}
