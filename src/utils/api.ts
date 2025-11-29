/**
 * API configuration utility for handling base URL
 * 
 * This utility requires VITE_BASE_URL to be defined in the .env file
 * - Local development (using .env files)
 * - Lovable deployment (using environment variables)
 * - No fallback URLs - environment variable is mandatory
 */

// Get the base URL from environment variables with fallback
export const getBaseUrl = (): string => {
  const viteBaseUrl = import.meta.env.VITE_BASE_URL;
  
  // Use environment variable if available, otherwise use default
  return viteBaseUrl || 'https://robotmanagerv1test.qikpod.com';
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
  get baseUrl() {
    return getBaseUrl();
  },
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
