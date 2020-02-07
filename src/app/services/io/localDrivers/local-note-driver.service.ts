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

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])

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

  getNote(uuid: string): Observable<Note> {
    if (!this._elS.isElectron) return
    const noteFile = this._elS.path.join(this._paS.getNotesFolder(), uuid, 'note')
    const metaFile = this._elS.path.join(this._paS.getNotesFolder(), uuid, 'meta.json')
    const metaPromise = this.getMetaFromJson(metaFile)                    // #1 fetch metadata
    const contentPromise = this._elS.fs.readFile(noteFile, 'utf8')        // #2 fetch note content
    const unionPromise: Promise<[NoteMetadata, string]> = Promise.all([metaPromise, contentPromise])
    return from(unionPromise.then((c:[NoteMetadata, string])=> ({meta: c[0], content: c[1]} as Note)) )
  }
  saveNote(note: Note): Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  saveNewNote(content: string, title?: string): Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  editMetadata(newMetadata: NoteMetadata): Observable<boolean> {
    throw new Error("Method not implemented.");
  }

}
