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

/**
 * Same thing as the Array.filter() method but with an asynchronous predicate
 */
export async function asyncFilter<T>(arr: T[], predicate: (elem:T) => Promise<boolean>): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}

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
    .pipe(tap(() => this.pullMetadatas()))
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
    .pipe(tap(() => this.pullMetadatas()))
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

  /**
   * Get the last pullMetadatas() date registered in localStorage.
   * Returns `null` if never pulled.
   */
  public getLastPullDate(): Date {
    const lastPullRaw: string = localStorage.getItem("lastCloudPull")
    if (!lastPullRaw) return null
    return new Date(lastPullRaw)
  }

  /**
   * Get server's metadata
   */
  private pullMetadatas() {
    if (!navigator.onLine) return
    const lastPullDate = this.getLastPullDate()
    this.cloudAPIService.getListNotes().subscribe(async serverNotes => {
      // delta are server notes that are not cached or more recent
      let delta = await asyncFilter(serverNotes, async serverNote => {
        // Check if cache has a record for this note
        let cachedNote = await this.db.metadatas.get(serverNote.uuid).catch(() => null)
        // Keep the server's note if there is no cached note OR
        // if server's note it is more recent than cache note
        return ( !cachedNote || new Date(serverNote.lastEdit) > new Date(cachedNote.lastEdit) )
      })
      // Refresh cached noteMetadata with delta
      this.db.metadatas.bulkPut(delta)
      // Update subject
      this.metadatasSubject.next(serverNotes)
    })
  }

  /**
   * Push cached note contents and metadatas updates to server if they are more recent
   * TODO or does not exist
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
