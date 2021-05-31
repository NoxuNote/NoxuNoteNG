import { Injectable, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { Note } from "../../../types/Note"
import { NoteMetadata } from "../../../types/NoteMetadata"
import { CloudNoteAPIService } from "../cloud/cloud-note-api.service"
import { INoteAPI } from "../INoteAPI"
import { LocalNoteAPIService } from "./local-note-api.service"

@Injectable({
    providedIn: 'root'
  })
  export class CachedLocalNoteAPIService implements INoteAPI, OnInit {
  
    constructor(private localAPIService: LocalNoteAPIService) { }
  
    // private notes: Subject<Note[]> = new Subject()
  
    // private setupLocalStorage() {
    //   localStorage.setItem("cloudNotes", "{}")
    // }
  
    ngOnInit(): void {
      // if (! localStorage.getItem("cloudNotes") ) this.setupLocalStorage()
    }
  
    getListNotes(): Observable<NoteMetadata[]> {
      return this.localAPIService.getListNotes()
    }
  
    getNote(uuid: string): Observable<Note> {
      return this.localAPIService.getNote(uuid)
    }
    saveNote(note: Note): Observable<NoteMetadata> {
      return this.localAPIService.saveNote(note)
    }
    createNote(title?: string): Observable<NoteMetadata> {
      return this.localAPIService.createNote(title)
    }
    saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
      return this.localAPIService.saveMetadata(newMetadata)
    }
    removeNote(n: NoteMetadata): Observable<void> {
      return this.localAPIService.removeNote(n)
    }
  
  }
  