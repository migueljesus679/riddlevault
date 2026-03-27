import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';

class PythonBridge {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.pythonApiUrl,
      timeout: 30000,
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(path, data);
    return response.data;
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.client.get<T>(path);
    return response.data;
  }
}

export const pythonBridge = new PythonBridge();
