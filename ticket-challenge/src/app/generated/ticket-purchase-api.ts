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

export interface TicketPurchaseRequest {
  /**
   * Column coordinate of the seat
   * @min 0
   * @example 5
   */
  x: number;
  /**
   * Row coordinate of the seat
   * @min 0
   * @example 3
   */
  y: number;
}

export interface TicketPurchaseResponse {
  /**
   * Whether the purchase was successful
   * @example true
   */
  success: boolean;
  /**
   * Human-readable result message
   * @example "Ticket purchased successfully for seat (5, 3)"
   */
  message: string;
  /**
   * Unique identifier for the purchased ticket (only present if success is true)
   * @pattern ^ticket_\d+_\d+_\d+$
   * @example "ticket_1705319400000_5_3"
   */
  ticketId?: string;
}

export interface ErrorResponse {
  /**
   * Error type
   * @example "SEAT_ALREADY_RESERVED"
   */
  error: string;
  /**
   * Human-readable error message
   * @example "The selected seat is already reserved"
   */
  message: string;
  /**
   * Error occurrence timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  timestamp?: string;
}
