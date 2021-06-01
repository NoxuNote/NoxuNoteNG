import { Injectable, OnInit } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { tap } from "rxjs/operators"
import { Note } from "../../../types/Note"
import { NoteMetadata } from "../../../types/NoteMetadata"
import { INoteAPI } from "../INoteAPI"
import { LocalNoteAPIService } from "./local-note-api.service"

@Injectable({
    providedIn: 'root'
  })
  export class CachedLocalNoteAPIService implements INoteAPI {
  
    constructor(private localAPIService: LocalNoteAPIService) { }


    /**
     * Cache of note metadatas, SHOULD always be un sync with filesystem
     * because there is no function to write the whole cache to FS
     */
    private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])
    _listNotesSubjectObservable = this._listNotesSubject.asObservable()
  
    /**
     * You need to call refreshListNotes() after subscribing to this to
     * recreate cache
     */
    getListNotes(): Observable<NoteMetadata[]> {
      return this._listNotesSubjectObservable
    }
  
    getNote(uuid: string): Observable<Note> {
      return this.localAPIService.getNote(uuid)
    }
    
    saveNote(note: Note): Observable<NoteMetadata> {
      return this.localAPIService.saveNote(note)
      .pipe(tap(()=>this.refreshListNotes))
    }

    createNote(title?: string): Observable<NoteMetadata> {
      return this.localAPIService.createNote(title)
      .pipe(tap(()=>this.refreshListNotes()))
    }

    saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
      return this.localAPIService.saveMetadata(newMetadata)
      .pipe(tap(()=>this.refreshListNotes()))
    }

    removeNote(n: NoteMetadata): Observable<void> {
      return this.localAPIService.removeNote(n)
      .pipe(tap(console.debug), tap(()=>this.refreshListNotes()))
    }

    refreshListNotes() {
      this.localAPIService.getListNotes()
      .subscribe(newList => this._listNotesSubject.next(newList))
    }
  
  }
  