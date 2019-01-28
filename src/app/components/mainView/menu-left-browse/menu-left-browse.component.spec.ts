import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLeftBrowseComponent } from './menu-left-browse.component';

describe('MenuLeftBrowseComponent', () => {
  let component: MenuLeftBrowseComponent;
  let fixture: ComponentFixture<MenuLeftBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuLeftBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLeftBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
