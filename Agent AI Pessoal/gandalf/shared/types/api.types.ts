export interface HealthResponse {
  service: string;
  status: 'ok' | 'error';
  timestamp: string;
  dependencies?: Record<string, string>;
}
