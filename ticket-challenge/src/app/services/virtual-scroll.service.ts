import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Virtual scrolling service for handling large seat maps efficiently
 * Implements viewport-based rendering to maintain smooth performance with 100k+ seats
 */
@Injectable({
  providedIn: 'root'
})
export class VirtualScrollService {
  
  // Viewport configuration
  private viewport = {
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0
  };

  // Item dimensions
  private itemSize = {
    width: 20,
    height: 20,
    marginX: 2,
    marginY: 2
  };

  // Visible range subjects
  private visibleRowsSubject = new BehaviorSubject<{start: number, end: number}>({start: 0, end: 0});
  private visibleColsSubject = new BehaviorSubject<{start: number, end: number}>({start: 0, end: 0});

  constructor() { }

  /**
   * Gets observable for visible row range
   */
  get visibleRows$(): Observable<{start: number, end: number}> {
    return this.visibleRowsSubject.asObservable();
  }

  /**
   * Gets observable for visible column range
   */
  get visibleCols$(): Observable<{start: number, end: number}> {
    return this.visibleColsSubject.asObservable();
  }

  /**
   * Updates viewport dimensions and scroll position
   * @param viewport Viewport configuration
   */
  updateViewport(viewport: {width: number, height: number, scrollTop: number, scrollLeft: number}): void {
    this.viewport = { ...viewport };
    this.calculateVisibleRange();
  }

  /**
   * Updates item size configuration
   * @param itemSize Item dimensions
   */
  updateItemSize(itemSize: {width: number, height: number, marginX: number, marginY: number}): void {
    this.itemSize = { ...itemSize };
    this.calculateVisibleRange();
  }

  /**
   * Calculates which rows and columns are currently visible
   * Includes buffer for smooth scrolling
   */
  private calculateVisibleRange(): void {
    const buffer = 5; // Extra items to render outside viewport for smooth scrolling
    
    // Calculate visible rows
    const rowHeight = this.itemSize.height + this.itemSize.marginY;
    const visibleRowStart = Math.max(0, Math.floor(this.viewport.scrollTop / rowHeight) - buffer);
    const visibleRowCount = Math.ceil(this.viewport.height / rowHeight) + (buffer * 2);
    const visibleRowEnd = visibleRowStart + visibleRowCount;

    // Calculate visible columns
    const colWidth = this.itemSize.width + this.itemSize.marginX;
    const visibleColStart = Math.max(0, Math.floor(this.viewport.scrollLeft / colWidth) - buffer);
    const visibleColCount = Math.ceil(this.viewport.width / colWidth) + (buffer * 2);
    const visibleColEnd = visibleColStart + visibleColCount;

    // Update subjects
    this.visibleRowsSubject.next({start: visibleRowStart, end: visibleRowEnd});
    this.visibleColsSubject.next({start: visibleColStart, end: visibleColEnd});
  }

  /**
   * Gets the total height needed for all rows
   * @param totalRows Total number of rows
   * @returns Total height in pixels
   */
  getTotalHeight(totalRows: number): number {
    return totalRows * (this.itemSize.height + this.itemSize.marginY);
  }

  /**
   * Gets the total width needed for all columns
   * @param totalCols Total number of columns
   * @returns Total width in pixels
   */
  getTotalWidth(totalCols: number): number {
    return totalCols * (this.itemSize.width + this.itemSize.marginX);
  }

  /**
   * Gets the offset position for a specific row
   * @param rowIndex Row index
   * @returns Top offset in pixels
   */
  getRowOffset(rowIndex: number): number {
    return rowIndex * (this.itemSize.height + this.itemSize.marginY);
  }

  /**
   * Gets the offset position for a specific column
   * @param colIndex Column index
   * @returns Left offset in pixels
   */
  getColOffset(colIndex: number): number {
    return colIndex * (this.itemSize.width + this.itemSize.marginX);
  }

  /**
   * Checks if virtual scrolling should be enabled based on map size
   * @param rows Number of rows
   * @param cols Number of columns
   * @returns True if virtual scrolling should be used
   */
  shouldUseVirtualScroll(rows: number, cols: number): boolean {
    const totalSeats = rows * cols;
    // Enable virtual scrolling for maps with more than 10,000 seats
    return totalSeats > 10000;
  }

  /**
   * Gets current viewport information
   */
  getViewport() {
    return { ...this.viewport };
  }

  /**
   * Gets current item size configuration
   */
  getItemSize() {
    return { ...this.itemSize };
  }

  /**
   * Resets the service state
   */
  reset(): void {
    this.viewport = { width: 0, height: 0, scrollTop: 0, scrollLeft: 0 };
    this.visibleRowsSubject.next({start: 0, end: 0});
    this.visibleColsSubject.next({start: 0, end: 0});
  }
}
