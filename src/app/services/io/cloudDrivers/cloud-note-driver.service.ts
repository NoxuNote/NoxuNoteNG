import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { HttpClient } from '@angular/common/http';

let url = "http://localhost:4200/"

@Injectable({
  providedIn: 'root'
})
export class CloudNoteDriverService implements INoteDriver {

  /**
   * Note contents are nos cached, so you directly read and write them
   */

  /**
   * Cache of note metadatas, SHOULD always be un sync with filesystem
   * because there is no function to write the whole cache to FS
   */
  private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private http: HttpClient) { }

  getListNotes(): Observable<NoteMetadata[]> {
    return this.http.get<NoteMetadata[]>(url+"/notes")
  }

  refreshListNotes() {
    throw new Error('Method not implemented.');
  }

  getNote(uuid: string): Observable<Note> {
    throw new Error('Method not implemented.');
  }

  saveNote(note: Note): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }

  createNote(title?: string): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }
  
  saveMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }
  removeNote(n: NoteMetadata): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
