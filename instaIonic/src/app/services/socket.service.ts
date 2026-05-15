import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = false;
  private messageSubject = new Subject<any>();
  private connectedSubject = new Subject<boolean>();

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io('https://20.151.96.66', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000
    });
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectedSubject.next(true);
    });
    this.socket.on('disconnect', () => {
      this.connected = false;
      this.connectedSubject.next(false);
    });
    this.socket.on('new-message', (data: any) => {
      this.messageSubject.next(data);
    });
    this.socket.on('connect_error', () => {
      this.connected = false;
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
  }

  joinConversation(username: string) {
    this.socket?.emit('join', { conversation: username });
  }

  leaveConversation(username: string) {
    this.socket?.emit('leave', { conversation: username });
  }

  onNewMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onConnectionChange(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  isConnected(): boolean {
    return this.connected;
  }
}
