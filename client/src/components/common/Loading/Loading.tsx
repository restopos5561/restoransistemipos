import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingProps {
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen }) => {
    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 9999,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
        </Box>
    );
};

export default Loading; 