/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * 2D array representing the seat layout where 0 = available, 1 = reserved
 * @example [[0,1,0,1,0],[1,0,0,1,0],[0,0,1,0,1]]
 */
export type SeatMapResponse = number[][];

export interface ErrorResponse {
  /**
   * Error type
   * @example "MAP_NOT_FOUND"
   */
  error: string;
  /**
   * Human-readable error message
   * @example "Map with ID 'm213' not found"
   */
  message: string;
  /**
   * Error occurrence timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  timestamp?: string;
}
