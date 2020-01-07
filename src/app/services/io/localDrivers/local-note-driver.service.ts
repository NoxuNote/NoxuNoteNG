import { Injectable, SystemJsNgModuleLoaderConfig } from '@angular/core';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { PathsService } from './paths/paths.service';
import {JsonConvert, OperationMode, ValueCheckingMode} from "json2typescript"
import { resolve } from 'dns';

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
    const fs = this._elS.fs
    const path = this._elS.path
    const notesFolder = this._paS.getNotesFolder()
    // Loading JSON convert
    let jsonConvert: JsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
    // List elements inside notes folder
    fs.readdir(notesFolder)
      .then((elements: string[]) => {
        elements.forEach(el => {
          // Fetch the metadata file/folder
          const elPath = path.join(notesFolder, el)
          fs.stat(elPath).then(elStat => {
            // if the the element is a folder
            if (elStat.isDirectory()) {
              // check the metadata file
              fs.readJSON(path.join(elPath, 'meta.json')).then(jsonObj => {
                try {
                  const noteMetadata = jsonConvert.deserializeObject(jsonObj, NoteMetadata)
                  // add element to subject
                  this._listNotesSubject.next(this._listNotesSubject.getValue().concat(noteMetadata))
                } catch(e) {
                  console.warn(`[ERREUR FORMAT] ${path.join(elPath, 'meta.json')}`)
                  console.warn(e)
                }
              }).catch(console.warn)
            }
          })
        })
      }).catch(console.error)
  }

  getNote(uuid: string): Observable<Note> {
    throw new Error("Method not implemented.");
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
