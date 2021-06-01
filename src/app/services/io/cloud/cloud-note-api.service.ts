import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, forkJoin } from 'rxjs';
import { INoteAPI } from '../INoteAPI';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { StorageMode } from '../StorageMode';
import { AppConfig } from '../../../../environments/environment';

let url = AppConfig.production ? "https://cloud.noxunote.fr/mynotes/notes/"
                               : "http://127.0.0.1:4455/mynotes/notes/"

@Injectable({
  providedIn: 'root'
})
export class CloudNoteAPIService implements INoteAPI {

  constructor(private http: HttpClient) { }

  getListNotes(): Observable<NoteMetadata[]> {
    return this.http.get<NoteMetadata[]>(url)
  }

  getNote(uuid: string): Observable<Note> {
    let meta = this.http.get<NoteMetadata>(url+uuid)
    let content = this.http.get<string>(url+uuid+"/content").pipe(map(c => JSON.parse(c)))
    return forkJoin({ meta, content })
    .pipe(map(({meta, content}) => ({
      meta, 
      content,
      storageMode: StorageMode.Cloud
      }) 
    ))
  }

  saveNote(note: Note): Observable<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+note.meta.uuid+"/content", JSON.stringify(note.content))
  }

  createNote(title?: string): Observable<NoteMetadata> {
    return this.http.post<NoteMetadata>(url, title)
  }
  
  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    return this.http.put<NoteMetadata>(url+newMetadata.uuid, newMetadata)
  }

  removeNote(n: NoteMetadata): Observable<void> {
    return this.http.delete<void>(url + n.uuid)
  }

}
