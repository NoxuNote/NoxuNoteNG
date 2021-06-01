import { Injectable } from "@angular/core";
import { BehaviorSubject, from, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { INoteAPI } from "../INoteAPI";
import { CachedCloudDatabase } from "./CachedCloudDatabase";
import { CloudNoteAPIService } from "./cloud-note-api.service";
import _ from "lodash"
import { StorageMode } from "../StorageMode";

@Injectable({
  providedIn: 'root'
})
export class CachedCloudNoteAPIService implements INoteAPI {

  db = new CachedCloudDatabase()

  private metadatasSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private cloudAPIService: CloudNoteAPIService) { 
    this.db.metadatas.toArray().then(notes => {
      this.metadatasSubject.next(notes)
      // If PWA has just loaded and browser has internet, push cached data
      if (navigator.onLine) this.push()
    })
    // interval(10*1000).subscribe(() => this.pullMetadatas())
    // TODO : Maybe we should wait to push before force pulling.
    // -> Wait the end of push above.
    this.pullMetadatas()
    // When browser is back online, push cached data
    window.addEventListener("online", () => this.push())
  }

  getListNotes(): Observable<NoteMetadata[]> {
    // TODO - Optimiser en utilisant distinctUntilChange
    return this.metadatasSubject.asObservable()
  }

  getNote(uuid: string): Observable<Note> {
    if (navigator.onLine) {
      // Get and return server's response
      return this.cloudAPIService.getNote(uuid).pipe(tap(({content}) => {
        // Update cache
        this.db.content.put({uuid, content})
      }))
    } else {
      // Get from cache
      return from(
        Promise.all([
          this.db.metadatas.get(uuid),
          this.db.content.get(uuid)
        ])
        .then( ([meta, contentInDb]) => ({ meta, content: contentInDb.content, storageMode: StorageMode.Cloud} as Note) )
      )
    }
  }

  saveNote(note: Note): Observable<NoteMetadata> {
    note.meta.lastEdit = new Date()
    // Update Cache
    this.updateCachedMetadata(note.meta)
    this.db.content.put({uuid: note.meta.uuid, content: note.content})
    if (navigator.onLine) {
      // Send new meta and new note to server, then return response
      this.cloudAPIService.saveMetadata(note.meta).subscribe()
      return this.cloudAPIService.saveNote(note)
    } else {
      return of(note.meta)
    }
  }

  createNote(title?: string): Observable<NoteMetadata> {
    return this.cloudAPIService.createNote(title)
  }

  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    newMetadata.lastEdit = new Date()
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
      this.db.metadatas.bulkPut(notes)
      // Update subject
      this.metadatasSubject.next(notes)
    })
  }

  /**
   * Push cached note contents and metadatas updates to server if they are more recent
   * TODO or does not exist
   * @param serverMetas List of NoteMetadata server has
   */
  private push() {
    // Get last server metadatas to find differences
    this.cloudAPIService.getListNotes().subscribe(serverMetas => {
      const cachedMetas = this.metadatasSubject.getValue()
      // delta corresponds to the cached update that hasn't been sent to server
      const delta: NoteMetadata[] = _.differenceWith(cachedMetas, serverMetas, _.isEqual)
      delta.forEach(async d => {
        // If meta in cache is more recent than server's meta
        let serverLastEdit = new Date(serverMetas.find(m => m.uuid == d.uuid).lastEdit)
        let cacheLastEdit = new Date(d.lastEdit)
        if (cacheLastEdit > serverLastEdit) {
          // Get note content from cache and push new note
          let { content } = await this.db.content.get(d.uuid)
          let note = {
            content,
            meta: d,
            storageMode: StorageMode.Cloud
          }
          this.cloudAPIService.saveNote(note).subscribe()
          this.cloudAPIService.saveMetadata(note.meta).subscribe()
        }
      })
    }) 
  }

}
