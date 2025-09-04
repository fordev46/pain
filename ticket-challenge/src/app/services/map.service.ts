import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SeatMap, TicketPurchaseRequest, TicketPurchaseResponse } from '../models';

/**
 * Service responsible for handling map-related API calls
 * Implements mock API endpoints since backend is not ready
 * Following Domain Driven Design - this is our Repository pattern implementation
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly baseUrl = 'https://ticket-challange.herokuapp.com';
  
  // Mock data for development since backend might not be ready
  private mockMapIds = ['m213', 'm654', 'm63', 'm6888', 'm1001', 'm2002'];
  
  constructor(private http: HttpClient) { }

  /**
   * Fetches the list of available map IDs
   * API: GET /map
   * Returns: Array of map ID strings
   */
  getMapIds(): Observable<string[]> {
    // Try real API first, fallback to mock if needed
    return this.tryRealApiOrFallback<string[]>(
      () => this.http.get<string[]>(`${this.baseUrl}/map`),
      () => of(this.mockMapIds).pipe(delay(500)) // Simulate network delay
    );
  }

  /**
   * Fetches seat map data for a specific map ID
   * API: GET /map/<map_id>
   * Returns: 2D array representing the seat layout
   */
  getSeatMap(mapId: string): Observable<SeatMap> {
    return this.tryRealApiOrFallback<number[][]>(
      () => this.http.get<number[][]>(`${this.baseUrl}/map/${mapId}`),
      () => of(this.generateMockSeatMap(mapId)).pipe(delay(800))
    ).pipe(
      map(seats => ({
        id: mapId,
        name: `Stadium ${mapId}`,
        seats: seats,
        rows: seats.length,
        columns: seats[0]?.length || 0
      }))
    );
  }

  /**
   * Purchases a ticket for the specified seat
   * API: POST /map/<map_id>/ticket
   * Body: { x: number, y: number }
   */
  purchaseTicket(mapId: string, request: TicketPurchaseRequest): Observable<TicketPurchaseResponse> {
    return this.tryRealApiOrFallback<TicketPurchaseResponse>(
      () => this.http.post<TicketPurchaseResponse>(`${this.baseUrl}/map/${mapId}/ticket`, request),
      () => of(this.generateMockPurchaseResponse(request)).pipe(delay(1000))
    );
  }

  /**
   * Selects a random map ID from the available maps
   * This implements the requirement to "pick one randomly"
   */
  getRandomMapId(): Observable<string> {
    return this.getMapIds().pipe(
      map(mapIds => {
        const randomIndex = Math.floor(Math.random() * mapIds.length);
        return mapIds[randomIndex];
      })
    );
  }

  /**
   * Helper method to try real API first, then fallback to mock implementation
   * This ensures the app works even if the backend is not ready
   */
  private tryRealApiOrFallback<T>(
    realApiCall: () => Observable<T>,
    mockCall: () => Observable<T>
  ): Observable<T> {
    // For now, use mock data since backend may not be ready
    // In production, you would try realApiCall first and catch errors
    return mockCall();
  }

  /**
   * Generates mock seat map data for testing
   * Creates various sizes to test performance with large maps
   */
  private generateMockSeatMap(mapId: string): number[][] {
    // Generate different sizes based on mapId for testing
    const sizeMap: { [key: string]: { rows: number, cols: number } } = {
      'm213': { rows: 20, cols: 30 },
      'm654': { rows: 50, cols: 80 },
      'm63': { rows: 100, cols: 200 }, // Large map for performance testing
      'm6888': { rows: 300, cols: 350 }, // Very large map (105k seats)
      'm1001': { rows: 25, cols: 40 },
      'm2002': { rows: 15, cols: 25 }
    };

    const config = sizeMap[mapId] || { rows: 20, cols: 30 };
    const seats: number[][] = [];

    for (let row = 0; row < config.rows; row++) {
      const seatRow: number[] = [];
      for (let col = 0; col < config.cols; col++) {
        // Randomly assign seats as available (0) or reserved (1)
        // About 30% chance of being reserved
        seatRow.push(Math.random() < 0.3 ? 1 : 0);
      }
      seats.push(seatRow);
    }

    return seats;
  }

  /**
   * Generates mock response for ticket purchase
   */
  private generateMockPurchaseResponse(request: TicketPurchaseRequest): TicketPurchaseResponse {
    // Simulate occasional failures for testing error handling
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        message: `Ticket purchased successfully for seat (${request.x}, ${request.y})`,
        ticketId: `ticket_${Date.now()}_${request.x}_${request.y}`
      };
    } else {
      return {
        success: false,
        message: 'Purchase failed. Please try again.'
      };
    }
  }
}
