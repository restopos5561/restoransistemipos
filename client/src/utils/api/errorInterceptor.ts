import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export interface ApiError {
    success: false;
    error: {
        message: string;
        code?: string;
    };
}

export const handleApiError = (error: AxiosError<ApiError>) => {
    const errorMessage = error.response?.data?.error?.message || 'Bir hata oluştu';
    const errorCode = error.response?.data?.error?.code;

    // HTTP durum kodlarına göre özel mesajlar
    switch (error.response?.status) {
        case 401:
            switch(errorCode) {
                case 'INVALID_CREDENTIALS':
                    toast.error('Email veya şifre hatalı');
                    break;
                case 'TOKEN_EXPIRED':
                    toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın');
                    break;
                default:
                    toast.error('Oturum hatası');
            }
            break;
        case 403:
            toast.error('Bu işlem için yetkiniz bulunmuyor.');
            break;
        case 404:
            toast.error('İstediğiniz kaynak bulunamadı.');
            break;
        case 422:
            toast.error('Girdiğiniz bilgilerde hata var.');
            break;
        case 500:
            toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
            break;
        default:
            toast.error(errorMessage);
    }

    return Promise.reject(error);
}; 