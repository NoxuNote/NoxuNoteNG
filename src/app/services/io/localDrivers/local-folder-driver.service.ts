import { Injectable } from '@angular/core';
import { IFolderDriver } from '../IFolderDriver';
import { ElectronService } from '../../../core/services';
import { PathsService } from './paths/paths.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Folder } from '../../../types/Folder';
import { JsonConvert, ValueCheckingMode, JsonObject } from 'json2typescript';

@Injectable({
  providedIn: 'root'
})
export class LocalFolderDriverService implements IFolderDriver {
  private _listFoldersSubject = new BehaviorSubject<Folder[]>([])

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  getListFolders(): Observable<Folder[]> {
    return this._listFoldersSubject.asObservable();
  }

  refreshListFolders() {
    if (!this._elS.isElectron) return
    this._listFoldersSubject.next([]) // clear subject before updating it
    const filePath = this._elS.path.join(this._paS.getNoxuNoteDir(), 'folders.json')
    this.getMetaFromJson(filePath).then(folders => {
      this._listFoldersSubject.next(folders)
    })
  }

  private getMetaFromJson(filePath: string): Promise<Folder[]> {
    // Loading JSON convert
    let jsonConvert: JsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
    return new Promise((resolve, reject) => {
      this._elS.fs.readJSON(filePath).then(jsonObj => {
        let folders: Folder[] = []
        jsonObj.forEach(folderJson => {
          try {
            folders.push(jsonConvert.deserializeObject(folderJson, Folder))
          } catch(e) {
            reject(`[ERREUR FORMAT] ${filePath}`)
          }
        });
        resolve(folders)
      }).catch(e=>reject(e))
    })
  }

}
