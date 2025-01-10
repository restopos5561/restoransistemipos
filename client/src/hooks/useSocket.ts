import { useEffect, useCallback } from 'react';
import { SocketService } from '../services/socket';

export const useSocket = () => {
  useEffect(() => {
    // Initialize socket connection
    const socket = SocketService.initialize();

    return () => {
      // Cleanup socket connection on unmount
      SocketService.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    SocketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    SocketService.on(event, callback);
    return () => {
      SocketService.off(event, callback);
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    SocketService.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    SocketService.leaveRoom(room);
  }, []);

  return {
    emit,
    on,
    joinRoom,
    leaveRoom
  };
}; 