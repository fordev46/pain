/**
 * Core domain models for the ticket booking system
 * Following Domain Driven Design principles
 */

/**
 * Represents coordinates in a 2D seat map
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * Enum representing the possible states of a seat
 */
export enum SeatStatus {
  AVAILABLE = 0, // Seat is available for purchase
  RESERVED = 1, // Seat is already reserved/sold
  SELECTED = 2, // Seat is currently selected by user
}

/**
 * Represents a single seat in the stadium
 */
export interface Seat {
  coordinates: Coordinates;
  status: SeatStatus;
  id?: string; // Optional unique identifier
}

/**
 * Represents the complete seat map of a stadium
 * Contains a 2D array where each cell represents a seat
 */
export interface SeatMap {
  id: string;
  name?: string;
  seats: number[][]; // 2D array: 0 = available, 1 = reserved
  rows: number;
  columns: number;
}

/**
 * Request body for ticket purchase
 */
export interface TicketPurchaseRequest {
  x: number;
  y: number;
}

/**
 * Response from ticket purchase API
 */
export interface TicketPurchaseResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

/**
 * Stadium information
 */
export interface Stadium {
  id: string;
  name: string;
  mapId: string;
  image?: string;
}
