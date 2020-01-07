import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { StorageMode } from './StorageMode';
import fs = require('fs-extra');
import { LocalNoteDriverService } from './localDrivers/local-note-driver.service';
import { NoteMetadata } from '../../types/NoteMetadata';


@Injectable({
  providedIn: 'root'
})
export class IoService {

  constructor(private _localNoteDriverService: LocalNoteDriverService) { }

  public getNotes(source: StorageMode): Observable<NoteMetadata[]> {
    return this._localNoteDriverService.getListNotes()
  }

  public updateNotes(source: StorageMode) {
    this._localNoteDriverService.refreshListNotes()
  }

}
