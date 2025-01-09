export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    STATUS: (id: string) => `/products/${id}/status`,
    ADD_VARIANT: (id: string) => `/products/${id}/variants`,
    UPDATE_VARIANT: (id: string, variantId: string) => `/products/${id}/variants/${variantId}`,
    DELETE_VARIANT: (id: string, variantId: string) => `/products/${id}/variants/${variantId}`,
    ADD_OPTION_GROUP: (id: string) => `/products/${id}/options/groups`,
    ADD_OPTION: (id: string) => `/products/${id}/options`,
    UPDATE_OPTION: (id: string, optionId: string) => `/products/${id}/options/${optionId}`,
    DELETE_OPTION: (id: string, optionId: string) => `/products/${id}/options/${optionId}`,
    DELETE_OPTION_GROUP: (productId: string, groupId: string) => `/products/${productId}/options/groups/${groupId}`,
    OPTIONS: (id: string) => `/products/${id}/options`,
    PRICE_HISTORY: (id: string) => `/products/${id}/price-history`,
    VARIANTS: (id: string) => `/products/${id}/variants`,
    STOCK: (id: string) => `/products/${id}/stock`,
  },
  STOCKS: {
    LIST: '/stocks',
    DETAIL: (id: string) => `/stocks/${id}`,
    HISTORY: (id: string) => `/stocks/${id}/history`,
    UPDATE_QUANTITY: (id: string) => `/stocks/${id}/quantity`,
    MOVEMENTS: '/stocks/movements',
    EXPIRING: '/stocks/expiring',
    TRANSFER: '/stocks/transfer',
    COUNT: '/stocks/count',
    LOW: '/stocks/low',
  },
}; 