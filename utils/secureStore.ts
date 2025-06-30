// utils/secureStore.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const saveToken = async (key: keyof typeof TOKEN_KEYS, value: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEYS[key], value);
};

export const getToken = async (key: keyof typeof TOKEN_KEYS): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEYS[key]);
};

export const deleteToken = async (key: keyof typeof TOKEN_KEYS): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEYS[key]);
};

export const clearAllTokens = async (): Promise<void> => {
  await Promise.all([
    deleteToken('ACCESS_TOKEN'),
    deleteToken('REFRESH_TOKEN'),
  ]);
};