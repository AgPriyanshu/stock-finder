import { LocalStorageKeys } from "./constants";
import { LocalStorageManager } from "./local-storage-manager";

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return LocalStorageManager.getItem<string>(LocalStorageKeys.ACCESS_TOKEN);
};

/**
 * Store both access and refresh token
 */
export const setAccessToken = (accessToken: string): void => {
  LocalStorageManager.setItem(LocalStorageKeys.ACCESS_TOKEN, accessToken);
};

export const getOwnerToken = (): string | null => {
  return LocalStorageManager.getItem<string>(
    LocalStorageKeys.OWNER_TOKEN
  );
};

export const setOwnerToken = (ownerToken: string): void => {
  LocalStorageManager.setItem(
    LocalStorageKeys.OWNER_TOKEN,
    ownerToken
  );
};

export const clearOwnerToken = (): void => {
  LocalStorageManager.removeItem(LocalStorageKeys.OWNER_TOKEN);
};

export const clearToken = (): void => {
  LocalStorageManager.removeItem(LocalStorageKeys.ACCESS_TOKEN);
};

export interface SavedSearchLocation {
  lat: number;
  lng: number;
  label: string;
}

export const getSavedSearchLocation = (): SavedSearchLocation | null =>
  LocalStorageManager.getItem<SavedSearchLocation>(
    LocalStorageKeys.SEARCH_LOCATION
  );

export const setSavedSearchLocation = (location: SavedSearchLocation): void =>
  LocalStorageManager.setItem(LocalStorageKeys.SEARCH_LOCATION, location);

export const clearSavedSearchLocation = (): void =>
  LocalStorageManager.removeItem(LocalStorageKeys.SEARCH_LOCATION);
