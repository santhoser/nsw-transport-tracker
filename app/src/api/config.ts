import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'tfnsw_api_key';
const BASE_NAME = 'tfnsw_base_url';

export const DEFAULT_BASE_URL = 'https://api.transport.nsw.gov.au';

let apiKey: string | null = process.env.EXPO_PUBLIC_TFNSW_API_KEY ?? null;
let baseUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

export async function loadApiConfig(): Promise<void> {
  const [k, b] = await Promise.all([SecureStore.getItemAsync(KEY_NAME), SecureStore.getItemAsync(BASE_NAME)]);
  if (k) apiKey = k;
  if (b) baseUrl = b;
}

export async function saveApiConfig(key: string, base?: string): Promise<void> {
  apiKey = key.trim() || null;
  baseUrl = (base ?? '').trim() || DEFAULT_BASE_URL;
  if (apiKey) await SecureStore.setItemAsync(KEY_NAME, apiKey);
  else await SecureStore.deleteItemAsync(KEY_NAME);
  await SecureStore.setItemAsync(BASE_NAME, baseUrl);
}

export const getApiKey = () => apiKey;
export const getBaseUrl = () => baseUrl;
