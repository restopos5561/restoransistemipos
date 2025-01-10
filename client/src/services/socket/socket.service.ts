import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../config/constants';
import { tokenService } from '../token.service';

export class SocketService {
  private static socket: Socket | null = null;
  private static connectionAttempts = 0;
  private static maxAttempts = 10;
  private static retryDelay = 2000;

  static initialize() {
    if (this.socket) {
      console.log('🔌 [Socket.IO] Mevcut socket bağlantısı kullanılıyor');
      return this.socket;
    }

    const token = tokenService.getAccessToken();
    if (!token) {
      console.warn('🔌 [Socket.IO] Access token bulunamadı, bağlantı erteleniyor...');
      return null;
    }

    try {
      console.log('🔌 [Socket.IO] Bağlanılıyor:', API_CONFIG.SOCKET_URL);
      console.log('🔌 [Socket.IO] Token:', token.substring(0, 10) + '...');

      this.socket = io(API_CONFIG.SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: this.retryDelay,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: this.maxAttempts,
        timeout: 20000,
        forceNew: false,
        path: '/socket.io',
        auth: {
          token: `Bearer ${token}`
        }
      });

      this.socket.on('connect', () => {
        console.log('🔌 [Socket.IO] Bağlantı başarılı. Socket ID:', this.socket?.id);
        this.connectionAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Socket.IO] Bağlantı kesildi:', reason);
        if (reason === 'io server disconnect') {
          console.log('🔌 [Socket.IO] Server tarafından bağlantı kesildi, yeniden bağlanılıyor...');
          this.reconnect();
        }
      });

      return this.socket;
    } catch (error) {
      console.error('🔌 [Socket.IO] Initialization error:', error);
      return null;
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