/**
 * Converts a string from snake_case to camelCase at the type level
 */
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

/**
 * Recursively converts all keys in an object type from snake_case to camelCase
 * Handles nested objects and arrays
 */
export type SnakeToCamelCase<T> =
  T extends Array<infer U>
    ? Array<SnakeToCamelCase<U>>
    : T extends object
      ? {
          [K in keyof T as CamelCase<K & string>]: SnakeToCamelCase<T[K]>;
        }
      : T;
