import fetch from 'node-fetch';
import * as queryString from 'query-string';

export interface QiwiOptions {
  baseUrl?: string;
  headers?: { [key: string]: string };
}

export type Methods = 'GET' | 'POST';

export const defaultOptions = {
  baseUrl: 'https://edge.qiwi.com/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
};

export default class QiwiConnector {
  private apiKey: string;
  private options: QiwiOptions;

  constructor(apiKey: string, options?: QiwiOptions) {
    this.apiKey = apiKey;
    this.options = Object.assign(defaultOptions, { 'Authorization': `Bearer ${apiKey}` }, options)
  }

  /**
   * Execute query
   * @param {string} method
   * @param {string} endpoint
   * @param data - is object by default, used as query in case if GET, else as body
   * @param headers
   * @returns {Promise<void>}
   */
  async query(method: string, endpoint: string, data?: Object, headers?: { [key: string]: string }) {

    // Build URL
    let outUrl = method + endpoint;
    if (method === 'GET' && data) outUrl += '?' + queryString.stringify(data);

    // Build options
    const urlOptions: RequestInit = {
      method,
      headers: Object.assign(this.options, headers),
    };
    if (method !== 'GET') urlOptions.body = JSON.stringify(data);

    const response = await fetch(outUrl, urlOptions);
    const json = await response.json();
    if (response.status !== 200) throw new QiwiError(response.status, json ? json.message : '');

    return json;
  }
}

export class QiwiError extends Error {
  private statusCode: number;

  constructor(statusCode: number, message?: string) {
    super();

    this.stack = (new Error()).stack;
    this.statusCode = statusCode;
    this.message = message || `${this.statusCode} error`;
  }
}