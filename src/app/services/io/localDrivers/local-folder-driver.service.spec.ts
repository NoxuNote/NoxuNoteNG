import { TestBed } from '@angular/core/testing';

import { LocalFolderDriverService } from './local-folder-driver.service';

describe('LocalFolderDriverService', () => {
  let service: LocalFolderDriverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalFolderDriverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
