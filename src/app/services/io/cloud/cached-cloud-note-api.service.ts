import { Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { INoteAPI } from "../INoteAPI";
import { CloudNoteAPIService } from "./cloud-note-api.service";

@Injectable({
  providedIn: 'root'
})
export class CachedCloudNoteAPIService implements INoteAPI, OnInit {

  constructor(private cloudAPIService: CloudNoteAPIService) { }

  // private notes: Subject<Note[]> = new Subject()

  // private setupLocalStorage() {
  //   localStorage.setItem("cloudNotes", "{}")
  // }

  ngOnInit(): void {
    // if (! localStorage.getItem("cloudNotes") ) this.setupLocalStorage()
  }

  getListNotes(): Observable<NoteMetadata[]> {
    return this.cloudAPIService.getListNotes()
  }

  getNote(uuid: string): Observable<Note> {
    return this.cloudAPIService.getNote(uuid)
  }
  saveNote(note: Note): Observable<NoteMetadata> {
    return this.cloudAPIService.saveNote(note)
  }
  createNote(title?: string): Observable<NoteMetadata> {
    return this.cloudAPIService.createNote(title)
  }
  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    return this.cloudAPIService.saveMetadata(newMetadata)
  }
  removeNote(n: NoteMetadata): Observable<void> {
    return this.cloudAPIService.removeNote(n)
  }

}
