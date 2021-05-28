import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NoteTabsComponent } from './note-tabs.component';

describe('NoteTabsComponent', () => {
  let component: NoteTabsComponent;
  let fixture: ComponentFixture<NoteTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
