import React from 'react';
import { TextField, InputAdornment, useTheme, alpha } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  const theme = useTheme();

  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ''}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'white',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.95),
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.common.white, 0.95),
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            borderColor: theme.palette.primary.main
          }
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none'
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar; 