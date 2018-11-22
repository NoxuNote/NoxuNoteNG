import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLeftSaveComponent } from './menu-left-save.component';

describe('MenuLeftSaveComponent', () => {
  let component: MenuLeftSaveComponent;
  let fixture: ComponentFixture<MenuLeftSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuLeftSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLeftSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
