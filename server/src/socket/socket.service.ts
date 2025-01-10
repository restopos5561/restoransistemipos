import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { verifyToken } from '../utils/auth.utils';

export class SocketService {
  private static io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  static initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3002"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      },
      transports: ['websocket'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Auth middleware
    this.io.use((socket, next) => {
      try {
        console.log('[Socket.IO] Auth middleware - handshake:', {
          auth: socket.handshake.auth,
          headers: socket.handshake.headers
        });

        let token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          console.error('[Socket.IO] No token provided');
          return next(new Error('Authentication token is required'));
        }

        // "Bearer " prefix'ini kaldır
        if (token.startsWith('Bearer ')) {
          token = token.slice(7);
        }

        console.log('[Socket.IO] Processing token:', token.substring(0, 20) + '...');
        const decoded = verifyToken(token);
        console.log('[Socket.IO] Token verified successfully, user:', decoded);
        
        socket.data.user = decoded;
        next();
      } catch (error: any) {
        console.error('[Socket.IO] Auth error details:', {
          message: error.message,
          stack: error.stack
        });
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('[Socket.IO] Client connected:', {
        id: socket.id,
        user: socket.data.user
      });

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Client disconnected:', socket.id);
      });

      socket.on('error', (error) => {
        console.error('[Socket.IO] Socket error:', error.message);
      });
    });

    this.io.engine.on("connection_error", (err) => {
      console.error('[Socket.IO] Connection error:', err.message);
    });
  }

  static emit(event: string, data: any) {
    if (this.io) {
      console.log('[Socket.IO] Emitting event:', event);
      this.io.emit(event, data);
    }
  }

  static emitToRoom(room: string, event: string, data: any) {
    if (this.io) {
      console.log('[Socket.IO] Emitting to room:', room, 'event:', event);
      this.io.to(room).emit(event, data);
    }
  }
} 