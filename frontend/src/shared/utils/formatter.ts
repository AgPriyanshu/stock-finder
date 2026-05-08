/* eslint-disable */
import { camelCase, isArray, isObject, snakeCase, transform } from "lodash";

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * Handles nested objects and arrays
 *
 * @param obj - The object to convert (can be object, array, or primitive)
 * @returns The converted object with camelCase keys
 */
export const toCamelCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  if (isObject(obj)) {
    return transform(
      obj,
      (result: any, value: any, key: string) => {
        const camelKey = camelCase(key);
        // Recursively convert nested objects/arrays.
        result[camelKey] = toCamelCase(value);
      },
      {}
    ) as T;
  }

  return obj;
};

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 * Handles nested objects and arrays
 *
 * @param obj - The object to convert (can be object, array, or primitive)
 * @returns The converted object with snake_case keys
 */
export const toSnakeCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }

  if (isObject(obj)) {
    return transform(
      obj,
      (result: any, value: any, key: string) => {
        const snakeKey = snakeCase(key);
        // Recursively convert nested objects/arrays.
        result[snakeKey] = toSnakeCase(value);
      },
      {}
    ) as T;
  }

  return obj;
};
