/**
 * API configuration utility for handling base URL across different environments
 * 
 * This utility provides a robust way to handle API base URLs that works in:
 * - Local development (using .env files)
 * - Lovable deployment (using environment variables)
 * - Production builds with fallbacks
 */

// Get the base URL from environment variables with fallbacks
export const getBaseUrl = (): string => {
  // Try Vite environment variable first (for local development)
  const viteBaseUrl = import.meta.env.VITE_BASE_URL;
  
  // Fallback for production/Lovable deployment
  // In Lovable, you should set VITE_BASE_URL as an environment variable
  // If not set, use a sensible default
  const fallbackUrl = 'https://robotmanagerv1test.qikpod.com';
  
  // Return the first available URL
  return viteBaseUrl || fallbackUrl;
};

/**
 * Construct a full API URL with the given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  
  // Ensure the endpoint starts with a slash and doesn't have double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

/**
 * API configuration object for easy access
 */
export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  getApiUrl,
  
  // Common endpoints for reference
  endpoints: {
    user: {
      validate: '/user/validate',
      users: '/user/users',
      user: '/user/user'
    },
    nanostore: {
      trays: '/nanostore/trays',
      orders: '/nanostore/orders',
      transactions: '/nanostore/transactions',
      transaction: '/nanostore/transaction',
      item: '/nanostore/item',
      ordersComplete: '/nanostore/orders/complete',
      traysForOrder: '/nanostore/trays_for_order'
    }
  }
} as const;
