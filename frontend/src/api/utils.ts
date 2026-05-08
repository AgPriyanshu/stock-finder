import { toCamelCase, toSnakeCase } from "shared/utils";

/**
 * Type-safe wrapper for converting API responses to camelCase
 * Use this with your API response types
 *
 * @param response - The API response to convert
 * @returns The converted response with proper typing
 */
export const apiResponseMapper = <T>(response: unknown): T => {
  return toCamelCase<T>(response);
};

/**
 * Type-safe wrapper for converting request payloads to snake_case
 * Use this with your API request payloads
 *
 * @param payload - The request payload to convert
 * @returns The converted payload with snake_case keys
 */
export const apiRequestMapper = <T>(payload: unknown): T => {
  return toSnakeCase<T>(payload);
};
