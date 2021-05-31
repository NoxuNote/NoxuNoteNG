import { Injectable } from '@angular/core';
import { IFolderAPI } from '../IFolderAPI';
import { BehaviorSubject, Observable } from 'rxjs';
import { Folder } from '../../../types/Folder';


@Injectable({
  providedIn: 'root'
})
export class CloudFolderAPIService implements IFolderAPI {
  // Cache
  private _listFoldersSubject = new BehaviorSubject<Folder[]>([{
    uuid: "cloud",
    title: "Mes Documents Cloud",
    color: "#FFFFFF",
    description: "",
    noteUUIDs: [],
    parentFolder: null,
    data: {}
  }])

  constructor() { }

  getListFolders(): Observable<Folder[]> {
    return this._listFoldersSubject.asObservable();
  }

  refreshListFolders() {
    //TO DO
  }

  saveListFolders(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  createFolder(name: string, parentId?: string): Promise<Folder> {
    throw new Error('Method not implemented.');
  }

  updateFolder(f: Folder) {
    throw new Error('Method not implemented.');
  }

  removeFolder(f: Folder) {
    throw new Error('Method not implemented.');
  }
}