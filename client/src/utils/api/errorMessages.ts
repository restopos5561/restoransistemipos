export const ERROR_MESSAGES = {
    GENERAL: {
        UNEXPECTED: 'Beklenmeyen bir hata oluştu',
        NETWORK: 'İnternet bağlantınızı kontrol edin',
        SERVER: 'Sunucu hatası oluştu',
    },
    AUTH: {
        INVALID_CREDENTIALS: 'Geçersiz email veya şifre',
        SESSION_EXPIRED: 'Oturum süreniz doldu',
        UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
    },
    FORM: {
        REQUIRED: 'Bu alan zorunludur',
        INVALID_EMAIL: 'Geçerli bir email adresi girin',
        MIN_LENGTH: (min: number) => `En az ${min} karakter olmalı`,
        MAX_LENGTH: (max: number) => `En fazla ${max} karakter olmalı`,
    }
} as const; 