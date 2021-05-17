import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, forkJoin } from 'rxjs';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JsonConverter } from 'json2typescript';

let url = "http://127.0.0.1:4455/mynotes/notes/"

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
    return this._listNotesSubject.asObservable()
  }

  refreshListNotes() {
    this.http.get<NoteMetadata[]>(url).subscribe(note => this._listNotesSubject.next(note))
  }

  getNote(uuid: string): Observable<Note> {
    let meta = this.http.get<NoteMetadata>(url+uuid)
    let content = this.http.get<string>(url+uuid+"/content").pipe(map(c => JSON.parse(c)))
    return forkJoin([meta, content]).pipe(map(note => { console.log(note[1]); return ({meta: note[0], content: note[1]}) }))
  }

  saveNote(note: Note): Promise<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+note.meta.uuid+"/content", JSON.stringify(note.content)).toPromise()
  }

  async createNote(title?: string): Promise<NoteMetadata> {
    const newNote = await this.http.post<NoteMetadata>(url, title).toPromise()
    this.refreshListNotes();
    return newNote
  }
  
  saveMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+newMetadata.uuid, newMetadata).toPromise()
  }
  async removeNote(n: NoteMetadata): Promise<void> {
    const deletedNote = await this.http.delete<void>(url + n.uuid).toPromise()
    this.refreshListNotes();
    return deletedNote
  }
}
