import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Title1TextComponent } from './title1-text.component';

describe('Title1TextComponent', () => {
  let component: Title1TextComponent;
  let fixture: ComponentFixture<Title1TextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Title1TextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Title1TextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
