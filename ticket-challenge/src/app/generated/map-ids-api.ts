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

export interface ErrorResponse {
  /**
   * Error type
   * @example "INTERNAL_SERVER_ERROR"
   */
  error: string;
  /**
   * Human-readable error message
   * @example "Unable to retrieve map IDs"
   */
  message: string;
  /**
   * Error occurrence timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  timestamp?: string;
}
