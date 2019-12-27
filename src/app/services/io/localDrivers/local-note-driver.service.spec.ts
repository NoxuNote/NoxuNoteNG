import { TestBed } from '@angular/core/testing';

import { LocalNoteDriverService } from './local-note-driver.service';

describe('LocalNoteDriverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalNoteDriverService = TestBed.get(LocalNoteDriverService);
    expect(service).toBeTruthy();
  });
});
