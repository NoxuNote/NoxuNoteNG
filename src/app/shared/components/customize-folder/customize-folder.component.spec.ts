import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomizeFolderComponent } from './customize-folder.component';

describe('CustomizeFolderComponent', () => {
  let component: CustomizeFolderComponent;
  let fixture: ComponentFixture<CustomizeFolderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizeFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
