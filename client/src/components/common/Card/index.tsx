import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface CardProps extends Omit<MuiCardProps, 'variant'> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  customColor?: string;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledCardContent = styled(CardContent)<{ noPadding?: boolean }>(
  ({ theme, noPadding }) => ({
    padding: noPadding ? 0 : theme.spacing(2),
    flexGrow: 1,
  })
);

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  noPadding = false,
  customColor,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      {(title || subtitle || headerAction) && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            action={headerAction}
          />
          <Divider />
        </>
      )}
      <StyledCardContent noPadding={noPadding}>{children}</StyledCardContent>
      {footer && (
        <>
          <Divider />
          <CardActions>{footer}</CardActions>
        </>
      )}
    </StyledCard>
  );
};

export default Card; 