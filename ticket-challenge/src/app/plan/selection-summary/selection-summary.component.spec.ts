import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionSummaryComponent } from './selection-summary.component';
import { ButtonComponent } from '../../shared/button/button.component';

describe('SelectionSummaryComponent', () => {
  let component: SelectionSummaryComponent;
  let fixture: ComponentFixture<SelectionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectionSummaryComponent, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct selected seat count', () => {
    component.selectedSeats = new Set(['0-1', '1-2', '2-0']);
    expect(component.getSelectedSeatCount()).toBe(3);
  });

  it('should convert selected seats to coordinates', () => {
    component.selectedSeats = new Set(['0-1', '1-2']);
    const coords = component.getSelectedCoordinates();

    expect(coords).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 1 },
    ]);
  });

  it('should emit purchaseClicked when purchase button is clicked', () => {
    spyOn(component.purchaseClicked, 'emit');
    component.selectedSeats = new Set(['0-1']);

    component.onPurchaseClick();

    expect(component.purchaseClicked.emit).toHaveBeenCalled();
  });

  it('should emit clearSelectionClicked when clear button is clicked', () => {
    spyOn(component.clearSelectionClicked, 'emit');

    component.onClearSelectionClick();

    expect(component.clearSelectionClicked.emit).toHaveBeenCalled();
  });
});
