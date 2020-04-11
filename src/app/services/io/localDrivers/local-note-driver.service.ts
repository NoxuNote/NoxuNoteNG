import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { PathsService } from './paths/paths.service';
import { JsonConvert, ValueCheckingMode } from "json2typescript";
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class LocalNoteDriverService implements INoteDriver {

  /**
   * Note contents are nos cached, so you directly read and write them
   */

  /**
   * Cache of note metadatas, SHOULD always be un sync with filesystem
   * because there is no function to write the whole cache to FS
   */
  private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  getListNotes(): Observable<NoteMetadata[]> {
    return this._listNotesSubject.asObservable()
  }

  refreshListNotes() {
    if (!this._elS.isElectron) return
    this._listNotesSubject.next([]) // clear subject before updating it
    const fs = this._elS.fs // alias
    const path = this._elS.path // alias
    const notesFolder = this._paS.getNotesFolder()
    // List elements inside notes folder
    fs.readdir(notesFolder).then((elements: string[]) => {
      elements.forEach(el => {
        // Fetch the metadata file/folder
        const elPath = path.join(notesFolder, el)
        fs.stat(elPath).then(elStat => {
          // if the the element is a folder
          if (elStat.isDirectory()) {
            // check the metadata file
            this.getMetaFromJson(path.join(elPath, 'meta.json')).then(meta => {
              // append the meta to the subject
              this._listNotesSubject.next(this._listNotesSubject.getValue().concat(meta))
            }).catch(console.warn)
          }
        }).catch(console.error)
      })
    }).catch(console.error)
  }

  getNote(uuid: string): Observable<Note> {
    if (!this._elS.isElectron) return
    // Promise union between the 'note reading file promise' and the 'meta.json reading file promise'
    const unionPromise: Promise<[NoteMetadata, string]> = Promise.all([
      this.getMetaFromJson(this.getMetaPath(uuid)),
      this._elS.fs.readJson(this.getNotePath(uuid))
    ])
    return from(unionPromise.then( (c:[NoteMetadata, string]) => ( {meta: c[0], content: c[1]} as Note )))
  }
  
  async saveNote(note: Note): Promise<NoteMetadata> {
    if (!this._elS.isElectron) return
    // If folder doesn't exist, create it
    const notePath = this.getNoteFolderPath(note.meta.uuid)
    if (!this._elS.fs.existsSync(notePath)) {
      await this._elS.fs.mkdir(notePath)
    }
    // Promise union between the 'note writing file promise' and the 'meta.json writing file promise'
    await Promise.all([
      this._elS.fs.writeJson(this.getNotePath(note.meta.uuid), note.content),
      this.saveMetadata(note.meta)
    ])
    console.debug('wrote note content to FS')
    return note.meta
  }

  async createNote(title?: string): Promise<NoteMetadata> {
    if (!this._elS.isElectron) return
    // Note creation
    let meta = Object.assign(new NoteMetadata(), {
      uuid: uuidv4(),
      title: title? title : "Nouvelle Note",
      description: "",
      author: this._elS.os.userInfo().username,
      lastedit: new Date(),
      version: 1,
      data: {}
    })
    let note: Note = {
      meta: meta,
      content: {}
    }
    // Writing note on disk
    await this.saveNote(note)
    return meta
  }

  async saveMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    if (!this._elS.isElectron) return
    // Check if the note exist
    let cache: NoteMetadata[] = this._listNotesSubject.getValue()
    let isPresent = false
    cache.forEach((meta, index) => {
      if (meta.uuid == newMetadata.uuid) {
        console.debug('meta presente en cache, on update')
        isPresent = true
        // Update existing
        cache[index] = newMetadata
      }
    })
    if (!isPresent) {
      console.debug('meta non présente en cache, insertion')
      // Insert new
      cache = cache.concat(newMetadata)
    }
    // Update cache
    this._listNotesSubject.next(cache)
    // Write JSON
    console.debug('wrote metadata note to FS')
    await this._elS.fs.writeJson(this.getMetaPath(newMetadata.uuid), this.getJsonFromMeta(newMetadata))
    return newMetadata
  }

  async removeNote(n: NoteMetadata): Promise<void> {
    // Removing folder from disk
    const notePath = this.getNoteFolderPath(n.uuid)
    await this._elS.fs.emptyDir(notePath)
    await this._elS.fs.rmdir(notePath)
    // Mise à jour du cache
    let currentCache: NoteMetadata[] = this._listNotesSubject.getValue()
    currentCache.splice(currentCache.indexOf(n), 1)
    this._listNotesSubject.next(currentCache)
    return
  }
  
  /**
   * Returns the NoteMetadata readed from file
   * @param filePath Path of the note meta file
   */
  private getMetaFromJson(filePath: string): Promise<NoteMetadata> {
    // Loading JSON convert
    let jsonConvert: JsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
    return new Promise((resolve, reject) => {
      this._elS.fs.readJSON(filePath).then(jsonObj => {
        try {
          resolve(jsonConvert.deserializeObject(jsonObj, NoteMetadata))
        } catch(e) {
          reject(`[ERREUR FORMAT] ${filePath}`)
        }
      }).catch(e=>reject(e))
    })
  }

  /**
   * Returns the serialized JSON object from NoteMetada given object
   * @param meta Note metadata
   */
  private getJsonFromMeta(meta: NoteMetadata): Object {
    // Loading JSON convert
    let jsonConvert: JsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
    return jsonConvert.serializeObject(meta)
  }

  /**
   * Returns the path of note folder
   */
  private getNoteFolderPath(uuid: string): string {
    return this._elS.path.join(this._paS.getNotesFolder(), uuid)
  }

  /**
   * Returns the complete path of the stored note
   * @param uuid Note UUID
   */
  private getNotePath(uuid: string): string {
    return this._elS.path.join(this._paS.getNotesFolder(), uuid, 'note.json')
  }

  /**
   * Returns the complete path of the stored note meta file
   * @param uuid Note UUID
   */
  private getMetaPath(uuid: string): string {
    return this._elS.path.join(this._paS.getNotesFolder(), uuid, 'meta.json')
  }
  
}
