import AsyncStorage from '@react-native-async-storage/async-storage';

export type QueuedActionStatus = 'pending' | 'processing' | 'failed';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  priority: number;
  status: QueuedActionStatus;
}

const STORAGE_KEY = 'golden-erp-sync-queue';

export class BackgroundSyncQueue {
  private queue: QueuedAction[] = [];
  private isProcessing = false;
  private loaded = false;

  private async load() {
    if (this.loaded) return;
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: QueuedAction[] = JSON.parse(saved);
        this.queue = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      this.queue = [];
    } finally {
      this.loaded = true;
    }
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // ignore
    }
  }

  async add(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) {
    await this.load();
    const queued: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    this.queue.push(queued);
    await this.persist();
    await this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    if (!this.queue.length) return;

    this.isProcessing = true;
    try {
      // Önceliğe göre sırala (1 = yüksek)
      this.queue.sort((a, b) => a.priority - b.priority || a.timestamp - b.timestamp);

      while (this.queue.length) {
        const action = this.queue[0];
        action.status = 'processing';
        await this.persist();
        try {
          await this.executeAction(action);
          // Başarılı: kuyruktan çıkar
          this.queue.shift();
          await this.persist();
        } catch {
          action.retryCount += 1;
          action.status = action.retryCount >= 3 ? 'failed' : 'pending';
          await this.persist();
          if (action.status === 'failed') {
            // Hata alan aksiyonu kuyruktan kaldır
            this.queue.shift();
            await this.persist();
          }
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Gerçek backend entegrasyonu yapıldığında burada sipariş/stock vb. işlemler çağrılacak.
  // Şimdilik placeholder; offline-first pattern'i ayakta tutmak için yapısal olarak hazır.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'CREATE_ORDER':
        // TODO: Backend hazır olduğunda order create entegrasyonu yapılacak.
        return;
      default:
        return;
    }
  }

  getSnapshot(): QueuedAction[] {
    return [...this.queue];
  }
}

export const backgroundSyncQueue = new BackgroundSyncQueue();

