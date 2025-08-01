export function throughAllOrigins(url: string): string {
    const PROXY = import.meta.env.VITE_PROXY_URL;
    return `${PROXY}/raw?url=${encodeURIComponent(url)}`;
}

export function normalizeList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.results)) return raw.results;
  return [];
}

export function delay() {
  const ms = Number(import.meta.env.VITE_USE_MOCK_AUTH);
  return new Promise((resolve) => setTimeout(resolve, ms));
}