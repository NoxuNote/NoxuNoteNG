import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeNoteComponent } from './customize-note.component';

describe('CustomizeNoteComponent', () => {
  let component: CustomizeNoteComponent;
  let fixture: ComponentFixture<CustomizeNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizeNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
