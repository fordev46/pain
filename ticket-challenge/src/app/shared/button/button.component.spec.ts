import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click event when clicked', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    spyOn(component.clicked, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit click event when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    spyOn(component.clicked, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should apply correct CSS classes', () => {
    component.variant = 'success';
    component.size = 'large';
    component.disabled = true;

    const classes = component.getButtonClasses();

    expect(classes).toContain('app-button--success');
    expect(classes).toContain('app-button--large');
    expect(classes).toContain('app-button--disabled');
  });
});
