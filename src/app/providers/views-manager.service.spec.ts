import { TestBed, inject } from '@angular/core/testing';

import { ViewsManagerService } from './views-manager.service';

describe('ViewsManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewsManagerService]
    });
  });

  it('should be created', inject([ViewsManagerService], (service: ViewsManagerService) => {
    expect(service).toBeTruthy();
  }));
});
