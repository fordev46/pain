import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  AppMapIdList,
  AppSeatMap,
  AppSalon,
  AppTicketPurchaseInput,
  AppTicketPurchaseOutput,
} from '../models';
import { ApiService } from './core/api.service';
import { TicketAdapterService } from './adapters/ticket-adapter.service';
import { SeatMapResponse } from '../generated/seat-map-api';
import { TicketPurchaseRequest, TicketPurchaseResponse } from '../generated/ticket-purchase-api';
import { MapIdListResponse } from '../generated/map-ids-api';

/**
 * Service for managing stadium seat maps and ticket purchases.
 *
 * Provides methods to:
 * - Fetch available stadium maps
 * - Load seat layouts for specific stadiums
 * - Handle ticket purchase transactions
 *
 * Uses the ApiService for all HTTP requests with proper error handling,
 * caching, and mock response support for development/testing.
 */
@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private apiService: ApiService,
    private ticketAdapter: TicketAdapterService
  ) {}

  /**
   * Fetches all available stadium map identifiers.
   *
   * @returns Observable that emits an array of map ID strings
   */
  getMapIds(): Observable<AppMapIdList> {
    return this.apiService.get<undefined, MapIdListResponse>('/map', undefined, {
      cacheKey: 'map-ids',
      cacheDuration: 10 * 60 * 1000, // 10 minutes cache
      errorContext: 'خطا در دریافت شناسه‌های نقشه ورزشگاه',
      mockResponse: () => of(this.generateMockMapIdsResponse()).pipe(delay(500)),
    });
  }

  /**
   * Loads the complete seat layout for a specific stadium.
   *
   * @param mapId - The unique identifier for the stadium map
   * @returns Observable that emits a SeatMap object with stadium details and seat layout
   */
  getSeatMap(mapId: AppSalon['mapId']): Observable<AppSeatMap> {
    const stadiumName = this.getStadiumNameBecauseIsWasNotInTheApi(mapId);

    return this.ticketAdapter.adaptSeatMapResponse$(
      this.apiService.get<undefined, SeatMapResponse>(`/map/${mapId}`, undefined, {
        cacheKey: `seat-map-${mapId}`,
        cacheDuration: 5 * 60 * 1000, // 5 minutes cache
        errorContext: `خطا در دریافت نقشه صندلی‌ها برای ورزشگاه ${mapId}`,
        mockResponse: () => of(this.generateMockSeatMapResponse(mapId)).pipe(delay(800)),
      }),
      mapId,
      stadiumName
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
    mapId: AppSalon['mapId'],
    request: AppTicketPurchaseInput
  ): Observable<AppTicketPurchaseOutput> {
    // Convert domain input to API request format
    const apiRequest: TicketPurchaseRequest = {
      x: request.x,
      y: request.y,
    };

    return this.ticketAdapter.adaptTicketPurchaseResponse$(
      this.apiService.post<TicketPurchaseRequest, TicketPurchaseResponse>(
        `/map/${mapId}/ticket`,
        apiRequest,
        {
          errorContext: `خطا در خرید بلیت برای صندلی (${request.x}, ${request.y})`,
          mockResponse: () => of(this.generateMockPurchaseResponse(apiRequest)).pipe(delay(1000)),
        }
      )
    );
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
        message: `بلیت با موفقیت برای صندلی (${request.x}, ${request.y}) خریداری شد`,
        ticketId: `ticket_${Date.now()}_${request.x}_${request.y}`,
      };
    } else {
      return {
        success: false,
        message: 'خرید ناموفق. لطفاً دوباره تلاش کنید.',
      };
    }
  }

  /**
   * Generates a mock response for map IDs request.
   *
   * Returns a list of Iranian stadium map identifiers for development/testing.
   *
   * @returns Array of map ID strings
   */
  private generateMockMapIdsResponse(): MapIdListResponse {
    return ['m213', 'm654', 'm63', 'm6888', 'm1001', 'm2002'];
  }

  /**
   * Generates a mock seat map response for a specific stadium.
   *
   * Creates realistic seat layouts with varying dimensions and reservation patterns
   * based on the map ID to provide diverse testing scenarios.
   *
   * @param mapId - The stadium map identifier
   * @returns 2D array representing seat layout (0 = available, 1 = reserved)
   */
  private generateMockSeatMapResponse(mapId: string): SeatMapResponse {
    const stadiumConfigs: Record<string, { rows: number; cols: number; reservationRate: number }> =
      {
        m213: { rows: 20, cols: 25, reservationRate: 0.3 },
        m654: { rows: 15, cols: 20, reservationRate: 0.4 },
        m63: { rows: 12, cols: 18, reservationRate: 0.2 },
        m6888: { rows: 18, cols: 22, reservationRate: 0.5 },
        m1001: { rows: 16, cols: 24, reservationRate: 0.35 },
        m2002: { rows: 100000, cols: 50, reservationRate: 0.25 },
      };

    const config = stadiumConfigs[mapId] || { rows: 15, cols: 20, reservationRate: 0.3 };
    const seatMap: number[][] = [];

    for (let row = 0; row < config.rows; row++) {
      const currentRow: number[] = [];
      for (let col = 0; col < config.cols; col++) {
        let reservationChance = config.reservationRate;

        if (row < config.rows * 0.3) {
          reservationChance += 0.2;
        }

        const middleStart = Math.floor(config.cols * 0.25);
        const middleEnd = Math.floor(config.cols * 0.75);
        if (col >= middleStart && col <= middleEnd) {
          reservationChance += 0.1;
        }

        const isReserved = Math.random() < reservationChance ? 1 : 0;
        currentRow.push(isReserved);
      }
      seatMap.push(currentRow);
    }

    return seatMap;
  }
  getStadiumNameBecauseIsWasNotInTheApi(mapId: string): string {
    // Mock stadium names for different map IDs
    const stadiumNames: Record<string, string> = {
      m213: 'ورزشگاه آزادی',
      m654: 'ورزشگاه تختی',
      m63: 'ورزشگاه نقش جهان',
      m6888: 'فولاد آرنا',
      m1001: 'ورزشگاه یادگار امام',
      m2002: 'ورزشگاه شهید دستگردی',
    };

    return stadiumNames[mapId] || `ورزشگاه ${mapId}`;
  }
}
