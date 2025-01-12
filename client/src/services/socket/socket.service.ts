import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../config/constants';
import { tokenService } from '../token.service';

export class SocketService {
  private static socket: Socket | null = null;
  private static connectionAttempts = 0;
  private static maxAttempts = 5;
  private static retryDelay = 1000;
  private static retryTimer: NodeJS.Timeout | null = null;

  static initialize() {
    if (this.socket?.connected) {
      console.log('🔌 [Socket.IO] Mevcut aktif bağlantı kullanılıyor');
      return this.socket;
    }

    if (this.connectionAttempts >= this.maxAttempts) {
      console.error('🔌 [Socket.IO] Maksimum bağlantı denemesi aşıldı');
      return null;
    }

    const token = tokenService.getAccessToken();
    if (!token) {
      console.warn('🔌 [Socket.IO] Access token bulunamadı');
      return null;
    }

    try {
      console.log('🔌 [Socket.IO] Bağlanılıyor:', API_CONFIG.SOCKET_URL, {
        attempt: this.connectionAttempts + 1,
        maxAttempts: this.maxAttempts
      });

      this.socket = io(API_CONFIG.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: this.retryDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxAttempts,
        timeout: 10000,
        forceNew: false,
        path: '/socket.io',
        auth: {
          token: `Bearer ${token}`
        }
      });

      this.socket.on('connect', () => {
        console.log('✅ [Socket.IO] Bağlantı başarılı:', {
          socketId: this.socket?.id,
          attempt: this.connectionAttempts + 1
        });
        this.connectionAttempts = 0;
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [Socket.IO] Bağlantı hatası:', {
          error: error.message,
          attempt: this.connectionAttempts + 1
        });
        this.connectionAttempts++;
        this.scheduleReconnect();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Socket.IO] Bağlantı kesildi:', {
          reason,
          attempt: this.connectionAttempts + 1
        });
        
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.scheduleReconnect();
        }
      });

      return this.socket;
    } catch (error) {
      console.error('❌ [Socket.IO] Başlatma hatası:', error);
      this.connectionAttempts++;
      this.scheduleReconnect();
      return null;
    }
  }

  private static scheduleReconnect() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    if (this.connectionAttempts < this.maxAttempts) {
      const delay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
      console.log('🔄 [Socket.IO] Yeniden bağlanma planlandı:', {
        delay,
        attempt: this.connectionAttempts,
        maxAttempts: this.maxAttempts
      });

      this.retryTimer = setTimeout(() => {
        console.log('🔄 [Socket.IO] Yeniden bağlanılıyor...');
        this.reconnect();
      }, delay);
    }
  }

  static getSocket() {
    return this.socket || this.initialize();
  }

  static emit(event: string, data: any) {
    const socket = this.getSocket();
    if (socket) {
      console.log('[Socket.IO] Emitting event:', event);
      socket.emit(event, data);
    } else {
      console.warn('[Socket.IO] Cannot emit event, socket not connected:', event);
    }
  }

  static on(event: string, callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on(event, callback);
    }
  }

  static off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  static joinRoom(room: string) {
    const socket = this.getSocket();
    if (socket) {
      console.log('[Socket.IO] Joining room:', room);
      socket.emit('room:join', room);
    }
  }

  static leaveRoom(room: string) {
    const socket = this.getSocket();
    if (socket) {
      console.log('[Socket.IO] Leaving room:', room);
      socket.emit('room:leave', room);
    }
  }

  static disconnect() {
    if (this.socket) {
      console.log('[Socket.IO] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  static reconnect() {
    this.disconnect();
    return this.initialize();
  }
} 