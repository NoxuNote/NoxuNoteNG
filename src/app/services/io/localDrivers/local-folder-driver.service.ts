import { Injectable } from '@angular/core';
import { IFolderDriver } from '../IFolderDriver';
import { ElectronService } from '../../../core/services';
import { PathsService } from './paths/paths.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Folder } from '../../../types/Folder';
import { JsonConvert, ValueCheckingMode, JsonObject } from 'json2typescript';
import { v4 as uuidv4 } from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class LocalFolderDriverService implements IFolderDriver {
  // Cache
  private _listFoldersSubject = new BehaviorSubject<Folder[]>([])

  constructor(private _elS: ElectronService, private _paS: PathsService) { }

  createFolder(name: string, parentId?: string): Folder {
    let f: Folder = Object.assign(new Folder(), {
      uuid: uuidv4(),
      title: name,
      color: "#FFFFFF",
      description: "",
      noteUUIDs: [],
      parentFolder: parentId? parentId : null,
      data: {}
    })
    this.addFolderToCache(f)
    return f
  }
  
  updateFolder(f: Folder) {
    // Récupération du cache
    let currentCache: Folder[] = this._listFoldersSubject.getValue()
    for (let i=0; i<currentCache.length; i++) {
      // Remplacement de l'ancien dossier par le nouveau dans le cache
      if (currentCache[i].uuid == f.uuid) {
        currentCache[i] = f
      }
    }
    // Mise à jour du cache
    this._listFoldersSubject.next(currentCache)
  }

  removeFolder(f: Folder) {
    console.debug("suppression du dossier", f)
    if (!f) return
    // Récupération du cache
    let currentCache: Folder[] = this._listFoldersSubject.getValue()
    // Suppression du dossier
    // ATTENTION, cette opération supprime également l'élément
    // chez les tableaux des subscripters ! (currentCache -> même instance)
    currentCache.splice(currentCache.indexOf(f), 1)
    // Mise à jour du cache
    this._listFoldersSubject.next(currentCache)
  }

  getListFolders(): Observable<Folder[]> {
    return this._listFoldersSubject.asObservable();
  }

  refreshListFolders() {
    if (!this._elS.isElectron) return
    this._listFoldersSubject.next([]) // clear subject before updating it
    this.getMetaFromJson(this._paS.getFoldersJSONPath()).then(folders => {
      this._listFoldersSubject.next(folders)
    })
  }

  saveListFolders(): Promise<void> {
    // Loading JSON convert
    let jsonConvert: JsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
    return new Promise((resolve, reject) => {
      let outputJSON = []
      this._listFoldersSubject.getValue().forEach(folder => {
        try {
          outputJSON.push(jsonConvert.serializeObject(folder))
        } catch(e) {
          reject()
        }
      })
      this._elS.fs.writeJson(this._paS.getFoldersJSONPath(), outputJSON)
      resolve()
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

  /**
   * Ajoute un dossier dans le cache
   * @param f Dossier
   */
  private addFolderToCache(f: Folder) {
    this._listFoldersSubject.next(this._listFoldersSubject.getValue().concat(f))
  }

}
