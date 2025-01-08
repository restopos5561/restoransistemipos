import { z } from 'zod';
import { ERROR_MESSAGES } from '../utils/api/errorMessages';

export const loginSchema = z.object({
    email: z.string()
        .min(1, ERROR_MESSAGES.FORM.REQUIRED)
        .email(ERROR_MESSAGES.FORM.INVALID_EMAIL),
    password: z.string()
        .min(1, ERROR_MESSAGES.FORM.REQUIRED)
        .min(6, ERROR_MESSAGES.FORM.MIN_LENGTH(6)),
    rememberMe: z.boolean().optional().default(false)
});

export const registerSchema = z.object({
    name: z.string()
        .min(1, ERROR_MESSAGES.FORM.REQUIRED)
        .min(2, ERROR_MESSAGES.FORM.MIN_LENGTH(2))
        .max(50, ERROR_MESSAGES.FORM.MAX_LENGTH(50)),
    email: z.string()
        .min(1, ERROR_MESSAGES.FORM.REQUIRED)
        .email(ERROR_MESSAGES.FORM.INVALID_EMAIL),
    password: z.string()
        .min(1, ERROR_MESSAGES.FORM.REQUIRED)
        .min(6, ERROR_MESSAGES.FORM.MIN_LENGTH(6))
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>; 