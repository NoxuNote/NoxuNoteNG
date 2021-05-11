import { Injectable } from '@angular/core';
import { IFolderDriver } from '../IFolderDriver';
import { BehaviorSubject, Observable } from 'rxjs';
import { Folder } from '../../../types/Folder';


@Injectable({
  providedIn: 'root'
})
export class CloudFolderDriverService implements IFolderDriver {
  // Cache
  private _listFoldersSubject = new BehaviorSubject<Folder[]>([])

  constructor() { }

  getListFolders(): Observable<Folder[]> {
    throw new Error('Method not implemented.');
  }

  refreshListFolders() {
    throw new Error('Method not implemented.');
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