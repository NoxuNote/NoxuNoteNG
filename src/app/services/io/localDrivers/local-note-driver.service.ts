import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { PathsService } from './paths/paths.service';
import { JsonConvert, ValueCheckingMode } from "json2typescript"

@Injectable({
  providedIn: 'root'
})
export class LocalNoteDriverService implements INoteDriver {
  private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  getListNotes(): Observable<NoteMetadata[]> {
    return this._listNotesSubject.asObservable()
  }

  /**
   * NoteMetaData type guard
   * @description types doesn't exist at runtime. see https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
   * @param obj 
   * @return true if obj is compatible with NoteMetadata type
   */
  private isNoteMetaData(obj: any): obj is NoteMetadata {
    return obj.uuid !== undefined && obj.title !== undefined
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
    // Promise union between the 'note writing file promise' and the 'meta.json writing file promise'
    await Promise.all([
      this._elS.fs.writeJson(this.getNotePath(note.meta.uuid), note.content),
      this._elS.fs.writeJson(this.getMetaPath(note.meta.uuid), this.getJsonFromMeta(note.meta))
    ])
    return note.meta
  }

  saveNewNote(content: string, title?: string): Promise<NoteMetadata> {
    throw new Error("Method not implemented.");
  }

  editMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    throw new Error("Method not implemented.");
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
   * Returns the complete path of the stored note
   * @param uuid Note UUID
   */
  private getNotePath(uuid: string) {
    return this._elS.path.join(this._paS.getNotesFolder(), uuid, 'note')
  }

  /**
   * Returns the complete path of the stored note meta file
   * @param uuid Note UUID
   */
  private getMetaPath(uuid: string) {
    return this._elS.path.join(this._paS.getNotesFolder(), uuid, 'meta.json')
  }
  
}
