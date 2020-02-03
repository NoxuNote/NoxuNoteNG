import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this._localNoteDriverService.getNote(uuid)
  }

  public getNotes(source: StorageMode): Observable<NoteMetadata[]> {
    return this._localNoteDriverService.getListNotes()
  }

  public updateNotes(source: StorageMode) {
    this._localNoteDriverService.refreshListNotes()
  }

}
