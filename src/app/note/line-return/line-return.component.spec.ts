import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineReturnComponent } from './line-return.component';

describe('LineReturnComponent', () => {
  let component: LineReturnComponent;
  let fixture: ComponentFixture<LineReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
