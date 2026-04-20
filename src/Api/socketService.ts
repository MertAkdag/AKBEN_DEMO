/**
 * HaremAltın Socket.IO Servisi
 * 
 * Gerçek zamanlı fiyat güncellemeleri için Socket.IO bağlantı yöneticisi.
 * URL: https://socket.haremaltin.com:443
 * Event: price_changed
 * 
 * Singleton pattern ile tek bağlantı yönetimi sağlar.
 */

import { io, Socket } from 'socket.io-client';
import { logger } from '../Utils/logger';

const SOCKET_URL = 'https://socket.haremaltin.com:443';
const DEBUG = __DEV__;

/* ─── Bağlantı durumu ─── */
export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/* ─── Callback tipleri ─── */
type PriceCallback = (data: any) => void;
type StatusCallback = (status: SocketStatus) => void;

function log(...args: unknown[]) {
  if (DEBUG) logger.info('[Socket]', ...args);
}

class HaremAltinSocket {
  private socket: Socket | null = null;
  private status: SocketStatus = 'disconnected';
  private priceListeners: Set<PriceCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPriceData: any = null;

  /* ─── Bağlantı ─── */
  connect(): void {
    if (this.socket?.connected) {
      log('Zaten bağlı, yeni bağlantı açılmıyor');
      return;
    }

    // Önceki bağlantıyı temizle
    this.cleanup();
    this.updateStatus('connecting');
    log('Bağlantı kuruluyor:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 15000,
    });

    /* ─── Event handler'lar ─── */
    this.socket.on('connect', () => {
      log('Bağlantı başarılı! Socket ID:', this.socket?.id);
      this.updateStatus('connected');
      this.clearReconnectTimer();
    });

    this.socket.on('disconnect', (reason: string) => {
      log('Bağlantı kesildi. Sebep:', reason);
      this.updateStatus('disconnected');

      // Sunucu tarafından kapatıldıysa yeniden bağlan
      if (reason === 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      log('Bağlantı hatası:', error.message);
      this.updateStatus('error');
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      log('Yeniden bağlandı (Deneme:', attemptNumber, ')');
      this.updateStatus('connected');
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      log('Yeniden bağlanma denemesi:', attemptNumber);
      this.updateStatus('connecting');
    });

    this.socket.on('reconnect_failed', () => {
      log('Yeniden bağlanma başarısız');
      this.updateStatus('error');
      this.scheduleReconnect();
    });

    /* ─── Fiyat verisi ─── */
    this.socket.on('price_changed', (data: any) => {
      this.lastPriceData = data;
      this.priceListeners.forEach(cb => {
        try { cb(data); } catch (e) { log('Listener hatası:', e); }
      });
    });

    /* Debug: tüm event'leri logla */
    if (DEBUG) {
      this.socket.onAny((eventName: string, ...args: any[]) => {
        if (eventName !== 'price_changed') {
          log('Event:', eventName, args.length ? JSON.stringify(args).slice(0, 200) : '');
        }
      });
    }
  }

  /* ─── Bağlantıyı kes ─── */
  disconnect(): void {
    log('Bağlantı kesiliyor');
    this.clearReconnectTimer();
    this.cleanup();
    this.updateStatus('disconnected');
  }

  /* ─── Listener yönetimi ─── */
  onPriceChanged(callback: PriceCallback): () => void {
    this.priceListeners.add(callback);

    // Son veriyi hemen gönder (yeni listener için)
    if (this.lastPriceData) {
      try { callback(this.lastPriceData); } catch (_) {}
    }

    return () => { this.priceListeners.delete(callback); };
  }

  onStatusChanged(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    // Mevcut durumu hemen bildir
    callback(this.status);
    return () => { this.statusListeners.delete(callback); };
  }

  /* ─── Getter'lar ─── */
  getStatus(): SocketStatus { return this.status; }
  getLastPriceData(): any { return this.lastPriceData; }
  isConnected(): boolean { return this.status === 'connected'; }

  /* ─── Dahili yardımcılar ─── */
  private updateStatus(newStatus: SocketStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.statusListeners.forEach(cb => {
      try { cb(newStatus); } catch (_) {}
    });
  }

  private cleanup(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      log('Zamanlanmış yeniden bağlanma deneniyor...');
      this.connect();
    }, 10000);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

/* ─── Singleton export ─── */
export const haremSocket = new HaremAltinSocket();
