export const API_CONFIG = {
  BASE_URL: 'http://localhost:3002/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_WITH_BRANCH: '/auth/login/branch',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    STATUS: (id: string) => `/orders/${id}/status`,
    BULK_DELETE: '/orders/bulk-delete',
    BULK_STATUS: '/orders/bulk-status',
    PRINT: '/orders/print',
    ADD_ITEMS: (id: string) => `/orders/${id}/items`,
  },
  // Diğer endpoint'ler...
} as const;