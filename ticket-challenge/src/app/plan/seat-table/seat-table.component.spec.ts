import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SeatTableComponent } from './seat-table.component';
import { AppSeatMap, AppSeatStatus } from '../../models';

describe('SeatTableComponent', () => {
  let component: SeatTableComponent;
  let fixture: ComponentFixture<SeatTableComponent>;

  const mockSeatMap: AppSeatMap = {
    id: 'test-map',
    name: 'Test Stadium',
    rows: 3,
    columns: 3,
    seats: [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeatTableComponent],
      imports: [ScrollingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatTableComponent);
    component = fixture.componentInstance;
    component.seatMap = mockSeatMap;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit seatClick when a seat is clicked', () => {
    spyOn(component.seatClick, 'emit');

    const mockEvent = {
      target: {
        classList: {
          contains: () => true,
        },
        getAttribute: (attr: string) => (attr === 'data-row' ? '0' : '1'),
      },
    } as any;

    component.onSeatTableClick(mockEvent);

    expect(component.seatClick.emit).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it('should return correct seat status', () => {
    component.selectedSeats = new Set(['0-1']);

    expect(component.getSeatStatus(0, 0)).toBe(AppSeatStatus.AVAILABLE);
    expect(component.getSeatStatus(0, 1)).toBe(AppSeatStatus.SELECTED);
    expect(component.getSeatStatus(0, 2)).toBe(AppSeatStatus.RESERVED);
  });
});
