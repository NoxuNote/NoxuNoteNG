import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, from, Observable, of } from "rxjs";
import { flatMap, map, mergeMap, tap } from "rxjs/operators";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { INoteAPI } from "../INoteAPI";
import { CachedCloudDatabase } from "./CachedCloudDatabase";
import { CloudNoteAPIService } from "./cloud-note-api.service";
import _ from "lodash"
import { StorageMode } from "../StorageMode";
import { v4 as uuidv4 } from 'uuid';

export enum SYNC_STRATEGY {
  REMOVE_FROM_SERVER,
  REMOVE_FROM_CACHE,
  PULL,
  PUSH_POST, // Push cached note to server using POST (note doesn't exist on server)
  PUSH_PUT, // Push cached note to server using PUT (note already exists on server)
  CONFLICT,
  DO_NOTHING
}

/**
 * Same thing as the Array.filter() method but with an asynchronous predicate
 */
export async function asyncFilter<T>(arr: T[], predicate: (elem:T) => Promise<boolean>): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}

/**
 * Same thing as the Array.map() method but with an asynchronous method
 */
 export async function asyncMap<T,O>(arr: T[], method: (elem:T) => Promise<O>): Promise<T[]> {
  const results = await Promise.all(arr.map(method));
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
      if (navigator.onLine) this.sync().subscribe()
    })
    // interval(10*1000).subscribe(() => this.pullMetadatas())
    // When browser is back online, push cached data
    window.addEventListener("online", () => this.sync().subscribe())
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

  /**
   * Write note to cache and sync
   */
  saveNote(note: Note): Observable<NoteMetadata> {
    note.meta.lastEdit = new Date()
    // Update cache
    let updateCachePromise = Promise.all([
      this.db.metadatas.put(note.meta),
      this.db.content.put({uuid: note.meta.uuid, content: { "blocks": [] } }),
      // Then update subject according to cache
    ]).then(() => this.db.metadatas.toArray().then(notes => this.metadatasSubject.next(notes)))
    // Then synchronize
    return from(updateCachePromise).pipe(
      mergeMap(() => this.sync()),
      map(() => note.meta) // return meta
    )
  }

  /**
   * Create note in cache and sync
   */
  createNote(title?: string): Observable<NoteMetadata> {
    // Generate a new note metadata
    let meta = Object.assign(new NoteMetadata(), {
      uuid: uuidv4(),
      title: title? title : "Nouvelle Note",
      description: "",
      author: "",
      lastEdit: new Date(),
      version: 1,
      data: {}
    })
    // Update cache
    const updateCachePromise = Promise.all([
      this.db.metadatas.add(meta),
      this.db.content.add({uuid: meta.uuid, content: { "blocks": [] } })
    ])
    // Then synchronize
    return from(updateCachePromise).pipe(
      mergeMap(() => this.sync()),
      map(() => meta)
    )
  }

  importMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    return this.cloudAPIService.importMetadata(newMetadata)
  }

  importNote(newNote: Note): Observable<NoteMetadata> {
    return this.cloudAPIService.importNote(newNote)
  }

  /**
   * Update metadata in cache and sync
   */
  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    newMetadata.lastEdit = new Date()
    // Update cache
    const updateCachePromise = this.db.metadatas.update(newMetadata.uuid, newMetadata)
    // Then synchronize
    return from(updateCachePromise).pipe(
      mergeMap(() => this.sync()),
      map(() => newMetadata)
    )
  }

  /**
   * Remove note in cache and synx
   */
  removeNote(n: NoteMetadata): Observable<void> {
    // Remove note in cache
    const updateCachePromise = Promise.all([
      this.db.metadatas.delete(n.uuid),
      this.db.content.delete(n.uuid)
    ])
    // Then synchronize
    return from(updateCachePromise).pipe(
      mergeMap(() => this.sync())
    )
  }

  /**
   * Synchronizes cached notes and server notes
   */
  public sync(): Observable<any> {
    if (!navigator.onLine) return of(null)
    console.log("Synchronization...")
    const last_sync = this.db.getLastSyncDate()
    return forkJoin([
      from(this.db.metadatas.toArray()),
      this.cloudAPIService.getListNotes()
    ]).pipe(flatMap( ([cachedNotes, serverNotes]) => {
      const cachedNotesUuids = cachedNotes.map(n => n.uuid)
      const serverNotesUuids = serverNotes.map(n => n.uuid)
      const uuids = [ ...new Set([...cachedNotesUuids, ...serverNotes.map(n => n.uuid)]) ]
      if (uuids.length == 0) return of(null)
      return forkJoin(uuids.map(uuid => {

        const is_in_cache = cachedNotesUuids.includes(uuid)
        const is_in_server = serverNotesUuids.includes(uuid)
        const cachedNote = is_in_cache && cachedNotes.find(n => n.uuid == uuid)
        const serverNote = is_in_server && serverNotes.find(n => n.uuid == uuid)
        const cache_more_recent_than_server = is_in_cache && is_in_server && new Date(cachedNote.lastEdit) > new Date(serverNote.lastEdit)
        const cache_more_recent_than_last_sync = is_in_cache && new Date(cachedNote.lastEdit) > last_sync
        const server_more_recent_than_last_sync = is_in_server && new Date(serverNote.lastEdit) > last_sync
        switch (CachedCloudNoteAPIService.getSyncStrategy(is_in_cache, is_in_server, cache_more_recent_than_server, cache_more_recent_than_last_sync, server_more_recent_than_last_sync)) {
          case SYNC_STRATEGY.REMOVE_FROM_SERVER:
            console.debug(`Removing "${(cachedNote || serverNote).title}" from server.`)
            return this.cloudAPIService.removeNote(cachedNote || serverNote)
          case SYNC_STRATEGY.REMOVE_FROM_CACHE:
            console.debug(`Removing "${(cachedNote || serverNote).title}" from cache.`)
            return from(this.db.metadatas.delete(uuid))
          case SYNC_STRATEGY.PUSH_POST:
            console.debug(`Pushing "${(cachedNote || serverNote).title}" to server. (import using POST)`)
            return from(this.db.getNote(uuid)).pipe(
              mergeMap( note => this.cloudAPIService.importNote(note))
            )
          case SYNC_STRATEGY.PUSH_PUT:
            console.debug(`Pushing "${(cachedNote || serverNote).title}" to server. (update using PUT)`)
            return from(this.db.getNote(uuid)).pipe(
              mergeMap( note => forkJoin([this.cloudAPIService.saveMetadata(cachedNote), this.cloudAPIService.saveNote(note)]) ), 
            )
          case SYNC_STRATEGY.PULL:
            console.debug(`Pulling "${(cachedNote || serverNote).title}" from server.`)
            return this.cloudAPIService.getNote(uuid).pipe(
              mergeMap( note => from(this.db.updateNote(uuid, note)) )
            )
          case SYNC_STRATEGY.CONFLICT:
            console.log(`Conflict while syncing "${(cachedNote || serverNote).title}" uuid: ${uuid}`)
            return of(null)
          case SYNC_STRATEGY.DO_NOTHING:
            console.debug(`Do nothing for"${(cachedNote || serverNote).title}"`)
            return of(null)
          default:
            console.error("Illegal SYNC_STRATEGY")
        }
      }))

    }), 
    map(() => {    
        this.db.setLastSyncDate(new Date())
        console.debug("Sync done.")
    })
    )
  }

  /**
   * Returns the best sync strategy according to truth table
   * https://pollen-burglar-629.notion.site/Noxunote-Cloud-a08546d592db41c5bae9a166358f4d4c
   */
  public static getSyncStrategy(is_in_cache, is_in_server, cache_more_recent_than_server, cache_more_recent_than_last_sync, server_more_recent_than_last_sync): SYNC_STRATEGY {
    if (!is_in_cache && is_in_server && !server_more_recent_than_last_sync) 
      return SYNC_STRATEGY.REMOVE_FROM_SERVER
    if (!is_in_cache && is_in_server && server_more_recent_than_last_sync || 
         is_in_cache && is_in_server && !cache_more_recent_than_server && !cache_more_recent_than_last_sync && server_more_recent_than_last_sync)
      return SYNC_STRATEGY.PULL
    if (is_in_cache && !is_in_server && !cache_more_recent_than_last_sync)
      return SYNC_STRATEGY.REMOVE_FROM_CACHE
    if (is_in_cache && !is_in_server && cache_more_recent_than_last_sync)
      return SYNC_STRATEGY.PUSH_POST
    if (is_in_cache && is_in_server && cache_more_recent_than_server && cache_more_recent_than_last_sync && !server_more_recent_than_last_sync)
      return SYNC_STRATEGY.PUSH_PUT
    if (is_in_cache && is_in_server && !cache_more_recent_than_server && cache_more_recent_than_last_sync && server_more_recent_than_last_sync ||
        is_in_cache && is_in_server && cache_more_recent_than_server && cache_more_recent_than_last_sync && server_more_recent_than_last_sync)
      return SYNC_STRATEGY.CONFLICT
    if (is_in_cache && is_in_server && !cache_more_recent_than_server && !cache_more_recent_than_last_sync && !server_more_recent_than_last_sync)
      return SYNC_STRATEGY.DO_NOTHING
    console.error(is_in_cache, is_in_server, cache_more_recent_than_server, cache_more_recent_than_last_sync, server_more_recent_than_last_sync)
    throw Error("Illegal combination, unable to get sync strategy, check parameters.")
  }

  // public syncMetadatas() {
  //   // Get all metadatas on server
  //   this.cloudAPIService.getListNotes().subscribe(async serverNotes => {
  //     // delta are server notes that are not cached or more recent
  //     let delta = await asyncFilter(serverNotes, async serverNote => {
  //       // Check if cache has a record for this note
  //       let cachedNote = await this.db.metadatas.get(serverNote.uuid).catch(() => null)
  //       // Keep the server's note if there is no cached note OR
  //       // if server's note it is more recent than cache note
  //       return ( !cachedNote || new Date(serverNote.lastEdit) > new Date(cachedNote.lastEdit) )
  //     })
  //     // Refresh cached noteMetadata with delta
  //     this.db.metadatas.bulkPut(delta)
  //     // Update subject
  //     this.metadatasSubject.next(serverNotes)
  //   })
  // }

  // /**
  //  * Get server's metadata
  //  */
  // private pullMetadatas() {
  //   if (!navigator.onLine) return
  //   const lastPullDate = this.getLastPullDate()
  //   this.cloudAPIService.getListNotes().subscribe(async serverNotes => {
  //     // delta are server notes that are not cached or more recent
  //     let delta = await asyncFilter(serverNotes, async serverNote => {
  //       // Check if cache has a record for this note
  //       let cachedNote = await this.db.metadatas.get(serverNote.uuid).catch(() => null)
  //       // Keep the server's note if there is no cached note OR
  //       // if server's note it is more recent than cache note
  //       return ( !cachedNote || new Date(serverNote.lastEdit) > new Date(cachedNote.lastEdit) )
  //     })
  //     // Refresh cached noteMetadata with delta
  //     this.db.metadatas.bulkPut(delta)
  //     // Update subject
  //     this.metadatasSubject.next(serverNotes)
  //   })
  // }

  // /**
  //  * Push cached note contents and metadatas updates to server if they are more recent
  //  * TODO or does not exist
  //  */
  // private push() {
  //   // Get last server metadatas to find differences
  //   this.cloudAPIService.getListNotes().subscribe(serverMetas => {
  //     const cachedMetas = this.metadatasSubject.getValue()
  //     // delta corresponds to the cached update that hasn't been sent to server
  //     const delta: NoteMetadata[] = _.differenceWith(cachedMetas, serverMetas, _.isEqual)
  //     delta.forEach(async d => {
  //       // If meta in cache is more recent than server's meta
  //       let serverLastEdit = new Date(serverMetas.find(m => m.uuid == d.uuid).lastEdit)
  //       let cacheLastEdit = new Date(d.lastEdit)
  //       if (cacheLastEdit > serverLastEdit) {
  //         // Get note content from cache and push new note
  //         let { content } = await this.db.content.get(d.uuid)
  //         let note = {
  //           content,
  //           meta: d,
  //           storageMode: StorageMode.Cloud
  //         }
  //         this.cloudAPIService.saveNote(note).subscribe()
  //         this.cloudAPIService.saveMetadata(note.meta).subscribe()
  //       }
  //     })
  //   }) 
  // }

}

