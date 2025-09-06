import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TicketPurchaseResponse } from '../../generated/ticket-purchase-api';
import { AppTicketPurchaseOutput, AppSeatMap } from '../../models';
import { SeatMapResponse } from '../../generated/seat-map-api';

/**
 * Adapter service that transforms API responses into domain objects.
 *
 * This service acts as a boundary between the external API layer and the
 * internal domain model, ensuring that changes to the API structure don't
 * directly impact the application's business logic.
 */
@Injectable({
  providedIn: 'root',
})
export class TicketAdapterService {
  /**
   * Transforms the API ticket purchase response into the application's domain object.
   *
   * @param apiResponse - The raw response from the ticket purchase API
   * @returns Transformed domain object conforming to AppTicketPurchaseOutput interface
   */
  adaptTicketPurchaseResponse(apiResponse: TicketPurchaseResponse): AppTicketPurchaseOutput {
    return {
      success: apiResponse.success,
      message: apiResponse.message,
      ticketId: apiResponse.ticketId,
    };
  }

  /**
   * Transforms the API seat map response into the application's domain object.
   *
   * @param apiResponse - The raw seat map data from the API
   * @param mapId - The stadium map identifier
   * @param stadiumName - The name of the stadium
   * @returns Transformed domain object conforming to AppSeatMap interface
   */
  adaptSeatMapResponse(
    apiResponse: SeatMapResponse,
    mapId: string,
    stadiumName: string
  ): AppSeatMap {
    return {
      id: mapId,
      name: stadiumName,
      seats: apiResponse,
      rows: apiResponse.length,
      columns: apiResponse[0]?.length || 0,
    };
  }

  /**
   * Transforms an Observable of API ticket purchase response into domain object.
   *
   * @param apiResponse$ - Observable of the API response
   * @returns Observable of the transformed domain object
   */
  adaptTicketPurchaseResponse$(
    apiResponse$: Observable<TicketPurchaseResponse>
  ): Observable<AppTicketPurchaseOutput> {
    return apiResponse$.pipe(map(response => this.adaptTicketPurchaseResponse(response)));
  }

  /**
   * Transforms an Observable of API seat map response into domain object.
   *
   * @param apiResponse$ - Observable of the API response
   * @param mapId - The stadium map identifier
   * @param stadiumName - The name of the stadium
   * @returns Observable of the transformed domain object
   */
  adaptSeatMapResponse$(
    apiResponse$: Observable<SeatMapResponse>,
    mapId: string,
    stadiumName: string
  ): Observable<AppSeatMap> {
    return apiResponse$.pipe(
      map(response => this.adaptSeatMapResponse(response, mapId, stadiumName))
    );
  }
}
