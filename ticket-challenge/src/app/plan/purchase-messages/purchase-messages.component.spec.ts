import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseMessagesComponent } from './purchase-messages.component';
import { ButtonComponent } from '../../shared/button/button.component';

describe('PurchaseMessagesComponent', () => {
  let component: PurchaseMessagesComponent;
  let fixture: ComponentFixture<PurchaseMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchaseMessagesComponent, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit dismissMessages when dismiss is clicked', () => {
    spyOn(component.dismissMessages, 'emit');

    component.onDismissMessages();

    expect(component.dismissMessages.emit).toHaveBeenCalled();
  });
});
