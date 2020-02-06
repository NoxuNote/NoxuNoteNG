import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageMode } from './StorageMode';
import { LocalNoteDriverService } from './localDrivers/local-note-driver.service';
import { NoteMetadata } from '../../types/NoteMetadata';
import { Note } from '../../types/Note';


@Injectable({
  providedIn: 'root'
})
export class IoService {

  constructor(private _localNoteDriverService: LocalNoteDriverService) { }

  public getNote(source: StorageMode, uuid: string): Observable<Note> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.getNote(uuid)
      case StorageMode.Cloud:
        return of(null)
    }
  }

  public getNotes(source: StorageMode): Observable<NoteMetadata[]> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.getListNotes()
      case StorageMode.Cloud:
        return of(null)
    }
  }

  public updateNotes(source: StorageMode) {
    switch (source) {
      case StorageMode.Local:
        this._localNoteDriverService.refreshListNotes()
      case StorageMode.Cloud:
        return of(null)
    }
  }

}
