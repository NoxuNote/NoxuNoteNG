import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CorpsTextComponent } from './corps-text.component';

describe('CorpsTextComponent', () => {
  let component: CorpsTextComponent;
  let fixture: ComponentFixture<CorpsTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorpsTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorpsTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
