import React from 'react';
import { Stack, styled } from '@mui/material';
import { DatePicker, DateValidationError, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

interface DateRangePickerProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  size?: 'small' | 'medium';
}

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  },
  '& .MuiPickersLayout-root': {
    maxHeight: '380px',
    '& .MuiDialogActions-root': {
      padding: 0,
      margin: 0,
      '& + div': {
        marginTop: 0,
        paddingTop: 0
      }
    }
  },
  '& .MuiPickersDay-root': {
    fontSize: '0.875rem',
    width: '36px',
    height: '36px',
    borderRadius: '8px'
  },
  '& .MuiDialogActions-root': {
    marginBottom: 0,
    paddingBottom: 0
  }
}));

const localeText = {
  clearButtonLabel: 'Temizle'
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, size = 'medium' }) => {
  const [startDate, endDate] = value;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          '& .MuiFormControl-root': { 
            flex: 1 
          }
        }}
      >
        <StyledDatePicker
          label="Başlangıç"
          value={startDate}
          onChange={(value: unknown, _: PickerChangeHandlerContext<DateValidationError>) => onChange([value as Date | null, endDate])}
          format="dd.MM.yyyy"
          localeText={localeText}
          slotProps={{
            textField: {
              size: size,
              fullWidth: true
            },
            actionBar: {
              actions: ['clear']
            }
          }}
        />
        <StyledDatePicker
          label="Bitiş"
          value={endDate}
          onChange={(value: unknown, _: PickerChangeHandlerContext<DateValidationError>) => onChange([startDate, value as Date | null])}
          format="dd.MM.yyyy"
          minDate={startDate || undefined}
          localeText={localeText}
          slotProps={{
            textField: {
              size: size,
              fullWidth: true
            },
            actionBar: {
              actions: ['clear']
            }
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
};

export default DateRangePicker; 