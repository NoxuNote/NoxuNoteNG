import { Injectable } from '@angular/core';
import { Observable, from, of, Subject } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteAPI } from '../INoteAPI';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { PathsService } from './paths/paths.service';
import { JsonConvert, ValueCheckingMode } from "json2typescript";
import { v4 as uuidv4 } from 'uuid';
import { StorageMode } from '../StorageMode';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalNoteAPIService implements INoteAPI {

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  getListNotes(): Observable<NoteMetadata[]> {
    // TODO : fix this method before merging /!\
    let listNotes = []
    let listNotesSubject = new Subject<NoteMetadata[]>()
    if (!this._elS.isElectron) return of([])
    listNotesSubject.next([]) // clear subject before updating it
    const fs = this._elS.fs // alias
    const path = this._elS.path // alias
    const notesFolder = this._paS.getNotesFolder()
    // List elements inside notes folder
    fs.readdir(notesFolder).then((elements: string[]) => 
      Promise.all(elements.map( el => {
        // Fetch the metadata file/folder
        const elPath = path.join(notesFolder, el)
        return fs.stat(elPath)
        // if the the element is a folder, read meta.json
        .then(elStat => {
          if (elStat.isDirectory()) return this.getMetaFromJson(path.join(elPath, 'meta.json'))
        })
        // append the meta to the subject
        .then(meta => {
          if (!meta) return 
          listNotes.push(meta)
          listNotesSubject.next(listNotes)
        })
      }))
    )
    .catch(console.error)
    .finally(() => listNotesSubject.complete())
    return listNotesSubject.asObservable()
  }

  getNote(uuid: string): Observable<Note> {
    if (!this._elS.isElectron) return
    // Promise union between the 'note reading file promise' and the 'meta.json reading file promise'
    const unionPromise: Promise<[NoteMetadata, string]> = Promise.all([
      this.getMetaFromJson(this.getMetaPath(uuid)),
      this._elS.fs.readJson(this.getNotePath(uuid))
    ])
    return from(unionPromise.then( (c:[NoteMetadata, string]) => ({
      meta: c[0], 
      content: c[1],
      storageMode: StorageMode.Local
    } as Note )))
  }
  
  saveNote(note: Note): Observable<NoteMetadata> {
    if (!this._elS.isElectron) return
    const notePath = this.getNoteFolderPath(note.meta.uuid)
    return from(
      this.createFolderIfNotExists(notePath)
      .then(() => Promise.all([
          this._elS.fs.writeJson(this.getNotePath(note.meta.uuid), note.content),
          this.saveMetadata(note.meta)
      ]))
    ).pipe(map(() => note.meta))
  }

  async createFolderIfNotExists(path): Promise<void> {
    let exists = await this._elS.fs.pathExists(path)
    if (!exists) {
      return await this._elS.fs.mkdir(path)
    }
  }

  createNote(title?: string): Observable<NoteMetadata> {
    if (!this._elS.isElectron) return
    // Note creation
    let meta = Object.assign(new NoteMetadata(), {
      uuid: uuidv4(),
      title: title? title : "Nouvelle Note",
      description: "",
      author: this._elS.os.userInfo().username,
      lastEdit: new Date(),
      version: 1,
      data: {}
    })
    let note: Note = {
      meta: meta,
      content: {blocks: []},
      storageMode: StorageMode.Local
    }
    // Writing note on disk
    return this.saveNote(note)
  }

  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata> {
    if (!this._elS.isElectron) return
    return from( 
      this._elS.fs.writeJson(this.getMetaPath(newMetadata.uuid), this.getJsonFromMeta(newMetadata))
    ).pipe(map(() => newMetadata))
  }

  removeNote(n: NoteMetadata): Observable<void> {
    // Removing folder from disk
    const notePath = this.getNoteFolderPath(n.uuid)
    return from( this._elS.fs.emptyDir(notePath).then(() => this._elS.fs.rmdir(notePath)) )
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
