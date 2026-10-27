import { getApiKey, getBaseUrl } from './config';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function request(path: string, accept: string): Promise<Response> {
  const key = getApiKey();
  if (!key) throw new ApiError('No API key set. Add your TfNSW API key in Settings.', 401);
  const res = await fetch(`${getBaseUrl()}/${path}`, { headers: { Authorization: `apikey ${key}`, Accept: accept } });
  if (res.status === 401 || res.status === 403) throw new ApiError('API key rejected by TfNSW.', res.status);
  if (res.status === 429) throw new ApiError('Rate limit reached. Try again shortly.', 429);
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
  return res;
}

export async function getJson<T>(path: string): Promise<T> {
  return (await request(path, 'application/json')).json() as Promise<T>;
}

export async function getBytes(path: string): Promise<Uint8Array> {
  return new Uint8Array(await (await request(path, 'application/x-google-protobuf')).arrayBuffer());
}
