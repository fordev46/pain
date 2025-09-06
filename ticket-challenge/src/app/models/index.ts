export interface AppCoordinates {
  x: number;
  y: number;
}

export enum AppSeatStatus {
  AVAILABLE = 0,
  RESERVED = 1,
  SELECTED = 2,
}

export interface AppSeat {
  coordinates: AppCoordinates;
  status: AppSeatStatus;
  id?: string; // Optional unique identifier
}

export interface AppSeatMap {
  id: string;
  name?: string;
  seats: number[][]; // 2D array: 0 = available, 1 = reserved
  rows: number;
  columns: number;
}

export interface AppTicketPurchaseInput {
  x: number;
  y: number;
}

export interface AppTicketPurchaseOutput {
  success: boolean;
  message: string;
  ticketId?: string;
}

export interface AppSalon {
  id: string;
  name: string;
  mapId: string;
  image?: string;
}

export type AppMapIdList = string[];
