import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SeatMap, TicketPurchaseRequest, TicketPurchaseResponse } from '../models';

/**
 * Service for managing stadium seat maps and ticket purchases.
 *
 * Provides methods to:
 * - Fetch available stadium maps
 * - Load seat layouts for specific stadiums
 * - Handle ticket purchase transactions
 *
 * Currently uses mock data but designed to seamlessly switch to real API endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly baseUrl = 'https://ticket-challange.herokuapp.com';

  private mockMapIds = ['m213', 'm654', 'm63', 'm6888', 'm1001', 'm2002'];

  /** Stadium names in Persian mapped to their corresponding map IDs */
  private iranianStadiumNames: { [key: string]: string } = {
    m213: 'ورزشگاه آزادی', // Azadi Stadium
    m654: 'ورزشگاه انقلاب', // Enqelab Stadium
    m63: 'ورزشگاه تختی', // Takhti Stadium
    m6888: 'ورزشگاه شهید کاظمی', // Shahid Kazemi Stadium
    m1001: 'ورزشگاه امام رضا', // Imam Reza Stadium
    m2002: 'ورزشگاه شهید شیرودی', // Shahid Shirudi Stadium
  };

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the Persian stadium name for a given map ID.
   *
   * @param mapId - The unique identifier for the stadium map
   * @returns The Persian name of the stadium or a fallback name
   */
  getStadiumName(mapId: string): string {
    return this.iranianStadiumNames[mapId] || `Stadium ${mapId}`;
  }

  /**
   * Returns a list of all available Iranian stadiums with their identifiers.
   *
   * @returns Array of stadium objects containing id and Persian name
   */
  getAllIranianStadiums(): { id: string; name: string }[] {
    return this.mockMapIds.map(mapId => ({
      id: mapId,
      name: this.getStadiumName(mapId),
    }));
  }

  /**
   * Fetches all available stadium map identifiers.
   *
   * @returns Observable that emits an array of map ID strings
   */
  getMapIds(): Observable<string[]> {
    return this.tryRealApiOrFallback<string[]>(
      () => this.http.get<string[]>(`${this.baseUrl}/map`),
      () => of(this.mockMapIds).pipe(delay(500)) // Simulate realistic network latency
    );
  }

  /**
   * Loads the complete seat layout for a specific stadium.
   *
   * @param mapId - The unique identifier for the stadium map
   * @returns Observable that emits a SeatMap object with stadium details and seat layout
   */
  getSeatMap(mapId: string): Observable<SeatMap> {
    return this.tryRealApiOrFallback<number[][]>(
      () => this.http.get<number[][]>(`${this.baseUrl}/map/${mapId}`),
      () => of(this.generateMockSeatMap(mapId)).pipe(delay(800))
    ).pipe(
      map(seats => ({
        id: mapId,
        name: this.getStadiumName(mapId),
        seats: seats,
        rows: seats.length,
        columns: seats[0]?.length || 0,
      }))
    );
  }

  /**
   * Processes a ticket purchase for a specific seat.
   *
   * @param mapId - The stadium map identifier
   * @param request - Purchase request containing seat coordinates (x, y)
   * @returns Observable that emits the purchase result with success status and details
   */
  purchaseTicket(
    mapId: string,
    request: TicketPurchaseRequest
  ): Observable<TicketPurchaseResponse> {
    return this.tryRealApiOrFallback<TicketPurchaseResponse>(
      () => this.http.post<TicketPurchaseResponse>(`${this.baseUrl}/map/${mapId}/ticket`, request),
      () => of(this.generateMockPurchaseResponse(request)).pipe(delay(1000))
    );
  }

  /**
   * Attempts to call the real API first, with automatic fallback to mock data.
   *
   * This pattern ensures the application remains functional during development
   * or when the backend service is unavailable.
   *
   * @param realApiCall - Function that returns the real API Observable
   * @param mockCall - Function that returns the mock data Observable
   * @returns Observable from either the real API or mock implementation
   */
  private tryRealApiOrFallback<T>(
    realApiCall: () => Observable<T>,
    mockCall: () => Observable<T>
  ): Observable<T> {
    // Currently using mock data - in production this would attempt realApiCall() first
    // and fall back to mockCall() on network errors or service unavailability
    return mockCall();
  }

  /**
   * Generates realistic mock seat map data for testing.
   *
   * Creates stadium layouts of varying sizes to test application performance
   * with different data scales, from small venues to large stadiums.
   *
   * @param mapId - Stadium identifier used to determine map size and characteristics
   * @returns 2D array where 0 = available seat, 1 = reserved seat
   */
  private generateMockSeatMap(mapId: string): number[][] {
    // Different stadium sizes for comprehensive testing scenarios
    const sizeMap: { [key: string]: { rows: number; cols: number } } = {
      m213: { rows: 20, cols: 30 },
      m654: { rows: 50, cols: 80 },
      m63: { rows: 100, cols: 200 },
      m6888: { rows: 100000, cols: 50 },
      m1001: { rows: 25, cols: 40 },
      m2002: { rows: 15, cols: 25 },
    };

    const config = sizeMap[mapId] || { rows: 20, cols: 30 };
    const seats: number[][] = [];

    for (let row = 0; row < config.rows; row++) {
      const seatRow: number[] = [];
      for (let col = 0; col < config.cols; col++) {
        // Simulate realistic seat availability: ~30% reserved, 70% available
        seatRow.push(Math.random() < 0.3 ? 1 : 0);
      }
      seats.push(seatRow);
    }

    return seats;
  }

  /**
   * Creates a realistic mock response for ticket purchase requests.
   *
   * Simulates real-world scenarios including occasional failures to test
   * error handling and user experience under various conditions.
   *
   * @param request - The original purchase request with seat coordinates
   * @returns Mock purchase response with success/failure status and appropriate messaging
   */
  private generateMockPurchaseResponse(request: TicketPurchaseRequest): TicketPurchaseResponse {
    // Simulate realistic purchase success rate (90%) to test error handling
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        message: `Ticket purchased successfully for seat (${request.x}, ${request.y})`,
        ticketId: `ticket_${Date.now()}_${request.x}_${request.y}`,
      };
    } else {
      return {
        success: false,
        message: 'Purchase failed. Please try again.',
      };
    }
  }
}
