import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { PathsService } from './paths/paths.service';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class LocalNoteDriverService implements INoteDriver {

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  listNotes(): Observable<NoteMetadata[]> {
    if (!this._elS.isElectron) return of([])
    return from(new Promise<NoteMetadata[]>((resolve, reject) => {
      // Fetch the list of note folders
      this._elS.fs.readdir(this._paS.getNotesFolder())
        .then((files: string[]) => {
          // Array of metadatas
          let out: NoteMetadata[] = []
          files.forEach(f=>{
            // Fetch the metadata file
            this._elS.
          })
          resolve(out)
        })
        .catch(console.error)
    }))

  }
  getNote(uuid: string): Observable<Note> {
    throw new Error("Method not implemented.");
  }
  saveNote(note: Note): Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  saveNewNote(content: string, title?: string): Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  editMetadata(newMetadata: NoteMetadata): Observable<boolean> {
    throw new Error("Method not implemented.");
  }

}
