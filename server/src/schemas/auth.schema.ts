import { z } from 'zod';

// Form için validation şeması
export const loginSchema = z.object({
  email: z.string()
    .email('Geçerli bir email adresi girin'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  branchId: z.number().optional(),
  rememberMe: z.boolean().optional().default(false)
});

// Form tipi
export type LoginFormData = z.infer<typeof loginSchema>;

// API için validation şeması
export const AuthSchema = {
  register: z.object({
    body: z.object({
      name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
      email: z.string().email('Geçersiz email formatı'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Geçersiz email formatı'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
      branchId: z.number().int().positive('Branch ID pozitif bir sayı olmalıdır').optional(),
    }),
  }),

  loginWithBranch: z.object({
    body: z.object({
      email: z.string().email('Geçersiz email formatı'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
      branchId: z.number().int().positive('Branch ID pozitif bir sayı olmalıdır'),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Geçersiz email formatı'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token gerekli'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
      confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalıdır'),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Şifreler eşleşmiyor',
      path: ['confirmPassword'],
    }),
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token gerekli'),
    }),
  }),
};
