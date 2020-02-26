import { TestBed } from '@angular/core/testing';

import { MathjaxService } from './mathjax.service';

describe('MathjaxService', () => {
  let service: MathjaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MathjaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
