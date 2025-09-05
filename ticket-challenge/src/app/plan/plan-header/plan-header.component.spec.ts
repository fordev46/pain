import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanHeaderComponent } from './plan-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { SeatMap } from '../../models';

describe('PlanHeaderComponent', () => {
  let component: PlanHeaderComponent;
  let fixture: ComponentFixture<PlanHeaderComponent>;

  const mockSeatMap: SeatMap = {
    id: 'test-map',
    name: 'Test Stadium',
    rows: 10,
    columns: 15,
    seats: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanHeaderComponent, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanHeaderComponent);
    component = fixture.componentInstance;
    component.seatMap = mockSeatMap;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit backClicked when back button is clicked', () => {
    spyOn(component.backClicked, 'emit');

    component.onBackClick();

    expect(component.backClicked.emit).toHaveBeenCalled();
  });
});
