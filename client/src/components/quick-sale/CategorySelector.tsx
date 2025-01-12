import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '@/services/categories.service';

interface CategorySelectorProps {
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const theme = useTheme();

  // Kategorileri getir
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories({ isActive: true }),
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={100}
              height={32}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Kategoriler
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: 3,
          },
        }}
      >
        <Chip
          label="Tümü"
          color={selectedCategoryId === null ? 'primary' : 'default'}
          onClick={() => onSelectCategory(null)}
          sx={{
            minWidth: 80,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        />
        {categories?.map((category: any) => (
          <Chip
            key={category.id}
            label={category.name}
            color={selectedCategoryId === category.id ? 'primary' : 'default'}
            onClick={() => onSelectCategory(category.id)}
            sx={{
              minWidth: 80,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default CategorySelector; 