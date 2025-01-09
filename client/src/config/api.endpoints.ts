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
    DELETE_OPTION_GROUP: (id: string, groupId: string) => `/option-groups/${groupId}`,
  },
}; 