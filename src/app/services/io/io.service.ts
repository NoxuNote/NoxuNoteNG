import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageMode } from './StorageMode';
import { LocalNoteDriverService } from './localDrivers/local-note-driver.service';
import { NoteMetadata } from '../../types/NoteMetadata';
import { Note } from '../../types/Note';
import { Folder } from '../../types/Folder';
import { LocalFolderDriverService } from './localDrivers/local-folder-driver.service';


@Injectable({
  providedIn: 'root'
})
export class IoService {
  constructor(private _localNoteDriverService: LocalNoteDriverService, private _localFolderDriverService: LocalFolderDriverService) { }

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

  public getFolders(source: StorageMode): Observable<Folder[]> {
    switch (source) {
      case StorageMode.Local:
        return this._localFolderDriverService.getListFolders()    
      case StorageMode.Cloud:
        return of(null)
    }
  }
 
  public updateNotes(source: StorageMode) {
    switch (source) {
      case StorageMode.Local:
        this._localNoteDriverService.refreshListNotes()
      case StorageMode.Cloud:
        return
    }
  }

  updateFolders(source: StorageMode) {
    switch (source) {
      case StorageMode.Local:
        this._localFolderDriverService.refreshListFolders()
      case StorageMode.Cloud:
        return
    }
  }

  public saveNote(source: StorageMode, note: Note): Promise<NoteMetadata> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.saveNote(note)
      case StorageMode.Cloud:
        return
    }
  }

}
