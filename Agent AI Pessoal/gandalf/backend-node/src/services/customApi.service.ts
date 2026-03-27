import { CustomApi } from '../models/customApi.model.js';

export class CustomApiService {
  async list() {
    return CustomApi.find().sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    return CustomApi.findById(id).lean();
  }

  async create(data: {
    name: string;
    description?: string;
    baseUrl: string;
    auth?: { type: string; key?: string; value?: string; headerName?: string };
    endpoints?: Array<{ method: string; path: string; description?: string; headers?: Record<string, string>; body?: unknown }>;
  }) {
    return CustomApi.create(data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return CustomApi.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    await CustomApi.findByIdAndDelete(id);
  }

  async testEndpoint(apiId: string, endpointIndex: number, bodyOverride?: unknown) {
    const api = await CustomApi.findById(apiId).lean();
    if (!api) throw new Error('API not found');

    const endpoints = api.endpoints || [];
    if (endpointIndex < 0 || endpointIndex >= endpoints.length) throw new Error('Endpoint not found');

    const endpoint = endpoints[endpointIndex];
    const url = `${api.baseUrl}${endpoint.path}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(endpoint.headers as Record<string, string> || {}) };

    if (api.auth?.type === 'bearer' && api.auth.value) {
      headers[api.auth.headerName || 'Authorization'] = `Bearer ${api.auth.value}`;
    } else if (api.auth?.type === 'apikey' && api.auth.key && api.auth.value) {
      headers[api.auth.key] = api.auth.value;
    }

    const init: RequestInit = { method: endpoint.method, headers };
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      init.body = JSON.stringify(bodyOverride || endpoint.body || {});
    }

    const start = Date.now();
    const response = await fetch(url, init);
    const elapsed = Date.now() - start;

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      elapsed,
    };
  }
}

export const customApiService = new CustomApiService();
