import {  } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { CachedCloudNoteAPIService, SYNC_STRATEGY } from './cached-cloud-note-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('CachedCloudNoteAPIService', () => {

  let cachedService: CachedCloudNoteAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

    cachedService = TestBed.inject(CachedCloudNoteAPIService);
  });

  it('#getSyncStrategy should answer removing server', () => {
    expect(CachedCloudNoteAPIService.getSyncStrategy(
      false, true, null, null, false
    ))
    .toBe(SYNC_STRATEGY.REMOVE_FROM_SERVER);
  });

});
