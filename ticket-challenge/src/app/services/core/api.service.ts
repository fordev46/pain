import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

/**
 * Configuration interface for API requests
 */
export interface ApiRequestConfig<TParams = unknown, TResponse = unknown> {
  endpoint: string;
  method: 'GET' | 'POST';
  queryParams?: TParams;
  body?: TParams;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  errorContext?: string;
  mockResponse?: () => Observable<TResponse>;
}

/**
 * Configuration for the API service
 */
export interface ApiServiceConfig {
  baseUrl: string;
  useMock: boolean;
  defaultCacheDuration: number;
}

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Generic API service that handles HTTP requests, error handling, caching, and mocking
 *
 * Features:
 * - Support for GET and POST requests with proper typing
 * - Automatic error handling with ErrorHandlerService
 * - Response caching with configurable duration
 * - Mock response support for development/testing
 * - Type-safe request/response handling
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: ApiServiceConfig = {
    baseUrl: 'https://ticket-challange.herokuapp.com',
    useMock: true,
    defaultCacheDuration: 5 * 60 * 1000, // 5 minutes
  };

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Updates the API service configuration
   */
  updateConfig(config: Partial<ApiServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): ApiServiceConfig {
    return { ...this.config };
  }

  /**
   * Makes a GET request with query parameters
   */
  get<TParams = unknown, TResponse = unknown>(
    endpoint: string,
    queryParams?: TParams,
    options?: Partial<ApiRequestConfig<TParams, TResponse>>
  ): Observable<TResponse> {
    const config: ApiRequestConfig<TParams, TResponse> = {
      endpoint,
      method: 'GET',
      queryParams,
      ...options,
    };

    return this.makeRequest<TParams, TResponse>(config);
  }

  /**
   * Makes a POST request with a request body
   */
  post<TBody = unknown, TResponse = unknown>(
    endpoint: string,
    body: TBody,
    options?: Partial<ApiRequestConfig<TBody, TResponse>>
  ): Observable<TResponse> {
    const config: ApiRequestConfig<TBody, TResponse> = {
      endpoint,
      method: 'POST',
      body,
      ...options,
    };

    return this.makeRequest<TBody, TResponse>(config);
  }

  /**
   * Clears all cached responses
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clears a specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Makes the actual HTTP request or returns mock response
   */
  private makeRequest<TParams, TResponse>(
    config: ApiRequestConfig<TParams, TResponse>
  ): Observable<TResponse> {
    // Use mock if enabled and mock response is provided
    if (this.config.useMock && config.mockResponse) {
      return config.mockResponse();
    }

    // Check cache first for GET requests
    if (config.method === 'GET' && config.cacheKey) {
      const cached = this.getFromCache<TResponse>(config.cacheKey);
      if (cached) {
        return of(cached);
      }
    }

    // Build the full URL
    const url = `${this.config.baseUrl}${config.endpoint}`;

    // Make the HTTP request
    let request$: Observable<TResponse>;

    if (config.method === 'GET') {
      const params = this.buildHttpParams(config.queryParams as Record<string, unknown>);
      request$ = this.http.get<TResponse>(url, { params });
    } else {
      request$ = this.http.post<TResponse>(url, config.body);
    }

    return request$.pipe(
      tap(response => {
        // Cache GET responses if cache key is provided
        if (config.method === 'GET' && config.cacheKey) {
          this.saveToCache(
            config.cacheKey,
            response,
            config.cacheDuration || this.config.defaultCacheDuration
          );
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error, config.errorContext);
        throw error;
      })
    );
  }

  /**
   * Builds HttpParams from an object
   */
  private buildHttpParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return httpParams;
  }

  /**
   * Retrieves data from cache if still valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Saves data to cache
   */
  private saveToCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + duration,
    };

    this.cache.set(key, entry);
  }
}
