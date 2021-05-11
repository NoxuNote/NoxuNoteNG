import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, forkJoin } from 'rxjs';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

let url = "http://localhost:4455/mynotes/notes/"

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
    return this.http.get<NoteMetadata[]>(url)
  }

  refreshListNotes() {
    this._listNotesSubject.next([])
    this.getListNotes().subscribe(note => this._listNotesSubject.next(note))
  }

  getNote(uuid: string): Observable<Note> {
    let meta = this.http.get<NoteMetadata>(url+uuid)
    let content = this.http.get<Object>(url+uuid+"/content")
    return forkJoin([meta, content]).pipe(map(note => ({meta: note[0], content: note[1]})))
  }

  saveNote(note: Note): Promise<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+note.meta.uuid+"/content", JSON.stringify(note.content)).toPromise()
  }

  createNote(title?: string): Promise<NoteMetadata> {
    return this.http.post<NoteMetadata>(url, title).toPromise()
  }
  
  saveMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+newMetadata.uuid, newMetadata).toPromise()
  }
  removeNote(n: NoteMetadata): Promise<void> {
    return this.http.delete<void>(url + n.uuid).toPromise()
  }
}
