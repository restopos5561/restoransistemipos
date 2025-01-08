import React from 'react';
import { Pagination as MuiPagination, useTheme, alpha } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme();

  return (
    <MuiPagination
      count={totalPages}
      page={currentPage}
      onChange={(_, page) => onPageChange(page)}
      color="primary"
      shape="rounded"
      showFirstButton
      showLastButton
      sx={{
        '& .MuiPaginationItem-root': {
          borderRadius: 1.5,
          margin: '0 2px',
          color: theme.palette.text.secondary,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.main
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }
        },
        '& .MuiPaginationItem-previousNext': {
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          }
        }
      }}
    />
  );
};

export default Pagination; 