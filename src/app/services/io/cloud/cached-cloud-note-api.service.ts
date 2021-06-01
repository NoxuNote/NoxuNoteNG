import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, from, interval, Observable, Subject } from "rxjs";
import { distinctUntilChanged, first, map, tap } from "rxjs/operators";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { INoteAPI } from "../INoteAPI";
import { CachedCloudDatabase } from "./CachedCloudDatabase";
import { CloudNoteAPIService } from "./cloud-note-api.service";
import _ from "lodash"

@Injectable({
  providedIn: 'root'
})
export class CachedCloudNoteAPIService implements INoteAPI {

  db = new CachedCloudDatabase()

  private metadatasSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private cloudAPIService: CloudNoteAPIService) { 
    this.db.metadatas.toArray().then(notes => this.metadatasSubject.next(notes))
    // interval(10*1000).subscribe(() => this.pullMetadatas())
    this.pullMetadatas()
    // When browser is back online, push cached data
    window.addEventListener("online", () => {
      this.pushMetadatas()
    })
  }

  getListNotes(): Observable<NoteMetadata[]> {
    // TODO - Optimiser en utilisant distinctUntilChange
    return this.metadatasSubject.asObservable()
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
    if (navigator.onLine) {
      return this.cloudAPIService.saveMetadata(newMetadata)
      .pipe(tap(newMetadata => this.updateCachedMetadata(newMetadata)))
    } else {
      return this.updateCachedMetadata(newMetadata)
    }
  }

  removeNote(n: NoteMetadata): Observable<void> {
    return this.cloudAPIService.removeNote(n)
  }

  private updateCachedMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
     // Update subject
     let oldList = this.metadatasSubject.getValue()
     let oldMeta = oldList.find(meta => meta.uuid == newMetadata.uuid) 
     Object.assign(oldMeta, newMetadata)
     this.metadatasSubject.next(oldList)
     // Update cache
     return from(this.db.metadatas.put(newMetadata, newMetadata.uuid)).pipe(map(() => newMetadata))
  }

  private pullMetadatas() {
    if (!navigator.onLine) return
    this.cloudAPIService.getListNotes().subscribe(notes => {
      // Update cache
      this.db.metadatas.bulkAdd(notes)
      // Update subject
      this.metadatasSubject.next(notes)
    })
  }

  private pushMetadatas() {
    if (!navigator.onLine) return 
    this.cloudAPIService.getListNotes().subscribe(serverMetas => {
      const cachedMetas = this.metadatasSubject.getValue()
      const delta = _.differenceWith(cachedMetas, serverMetas, _.isEqual)
      delta.forEach(d => this.cloudAPIService.saveMetadata(d).subscribe())
    })
  }

}
