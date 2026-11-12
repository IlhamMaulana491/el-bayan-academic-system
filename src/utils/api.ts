import { handleClientFallback } from './clientFallbackApi.ts';

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type') || '';
    if (
      response.status === 404 ||
      response.status >= 500 ||
      (contentType.includes('text/html') && !input.includes('.html'))
    ) {
      return await handleClientFallback(input, init);
    }
    return response;
  } catch (err) {
    console.warn('Network error reaching backend, using client fallback for:', input, err);
    return await handleClientFallback(input, init);
  }
}
