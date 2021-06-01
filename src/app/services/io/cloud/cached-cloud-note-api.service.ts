import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, interval, Observable, Subject } from "rxjs";
import { distinctUntilChanged, first, tap } from "rxjs/operators";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { INoteAPI } from "../INoteAPI";
import { CachedCloudDatabase } from "./CachedCloudDatabase";
import { CloudNoteAPIService } from "./cloud-note-api.service";

@Injectable({
  providedIn: 'root'
})
export class CachedCloudNoteAPIService implements INoteAPI {

  db = new CachedCloudDatabase()

  metadatasSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private cloudAPIService: CloudNoteAPIService) { 
    this.db.metadatas.toArray().then(notes => this.metadatasSubject.next(notes))
    interval(10*1000).subscribe(() => this.pullMetadatas())
    this.pullMetadatas()
  }

  getListNotes(): Observable<NoteMetadata[]> {
    return this.metadatasSubject.asObservable().pipe(
      distinctUntilChanged((x, y) => JSON.stringify(x) == JSON.stringify(y))
    )
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

  private pullMetadatas() {
    this.cloudAPIService.getListNotes().subscribe(notes => {
      this.db.metadatas.bulkAdd(notes)
      this.metadatasSubject.next(notes)
    })
  }

}
