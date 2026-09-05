/**
 * UrbanEye Mobile Offline Queue & Batch Sync Worker
 * Uploads queued on-device hazard events to POST /api/v1/mobile/events/batch
 */

export interface MobileEventPayload {
  client_event_id: string;
  device_id: string;
  bus_reg_no: string;
  hazard_type: string;
  confidence: number;
  gps: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  heading: number;
  speed: number;
  timestamp: string;
  evidence_image_base64?: string;
  measurements?: any;
}

class MobileSyncWorker {
  private localQueue: MobileEventPayload[] = [];
  private serverUrl: string = 'http://10.16.41.204:8000';
  private apiToken: string = '';

  public setConfig(url: string, token: string) {
    if (url) self.serverUrl = url;
    if (token) self.apiToken = token;
  }

  public enqueueEvent(event: MobileEventPayload) {
    this.localQueue.push(event);
  }

  public getQueueCount(): number {
    return this.localQueue.length;
  }

  public async flushBatch(): Promise<{ accepted: number; duplicates: number }> {
    if (this.localQueue.length === 0) {
      return { accepted: 0, duplicates: 0 };
    }

    const batchToUpload = [...this.localQueue];

    try {
      const response = await fetch(`${this.serverUrl}/api/v1/mobile/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify({ events: batchToUpload })
      });

      if (response.ok) {
        const result = await response.json();
        // Clear successfully synced items
        this.localQueue = [];
        return {
          accepted: result.accepted || 0,
          duplicates: result.duplicates || 0
        };
      } else {
        console.warn('Sync batch returned error status:', response.status);
        return { accepted: 0, duplicates: 0 };
      }
    } catch (err) {
      console.error('Network offline, retaining local queue:', err);
      return { accepted: 0, duplicates: 0 };
    }
  }
}

export const syncWorker = new MobileSyncWorker();
