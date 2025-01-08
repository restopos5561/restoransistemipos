import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm, UseFormProps, FieldValues } from 'react-hook-form';
import { ZodSchema } from 'zod';

interface UseFormConfig<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
    schema: ZodSchema;
}

export const useForm = <T extends FieldValues>({ schema, ...config }: UseFormConfig<T>) => {
    return useReactHookForm<T>({
        ...config,
        resolver: zodResolver(schema),
    });
}; 