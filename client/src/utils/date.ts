import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy HH:mm', { locale: tr });
}; 