import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageMode } from './StorageMode';
import { LocalNoteDriverService } from './localDrivers/local-note-driver.service';
import { NoteMetadata } from '../../types/NoteMetadata';
import { Note } from '../../types/Note';
import { Folder } from '../../types/Folder';
import { LocalFolderDriverService } from './localDrivers/local-folder-driver.service';


@Injectable({
  providedIn: 'root'
})
export class IoService {
  constructor(private _localNoteDriverService: LocalNoteDriverService, private _localFolderDriverService: LocalFolderDriverService) { }

  /*
   *
   * ------------- NOTES -------------
   * 
   */

  public getNote(source: StorageMode, uuid: string): Observable<Note> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.getNote(uuid)
      case StorageMode.Cloud:
        return of(null)
    }
  }

  public getListNotes(source: StorageMode): Observable<NoteMetadata[]> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.getListNotes()
      case StorageMode.Cloud:
        return of(null)
    }
  }
  public saveNote(source: StorageMode, note: Note): Promise<NoteMetadata> {
    switch (source) {
      case StorageMode.Local:
        return this._localNoteDriverService.saveNote(note)
      case StorageMode.Cloud:
        return
    }
  }

  public refreshListNotes(source: StorageMode) {
    switch (source) {
      case StorageMode.Local:
        this._localNoteDriverService.refreshListNotes()
      case StorageMode.Cloud:
        return
    }
  }

  /*
   *
   * ------------- FOLDERS -------------
   * 
   */

  public getListFolders(source: StorageMode): Observable<Folder[]> {
    switch (source) {
      case StorageMode.Local:
        return this._localFolderDriverService.getListFolders()
      case StorageMode.Cloud:
        return of(null)
    }
  }

  refreshListFolders(source: StorageMode) {
    switch (source) {
      case StorageMode.Local:
        this._localFolderDriverService.refreshListFolders()
      case StorageMode.Cloud:
        return
    }
  }

  saveListFolders(source: StorageMode): Promise<void> {
    switch (source) {
      case StorageMode.Local:
        return this._localFolderDriverService.saveListFolders()
      case StorageMode.Cloud:
        return
    }
  }

  createFolder(source: StorageMode, name: string, parentId?: string): Folder {
    switch (source) {
      case StorageMode.Local:
        return this._localFolderDriverService.createFolder(name, parentId)
      case StorageMode.Cloud:
        return
    }
  }

  updateFolder(source: StorageMode, f: Folder) {
    switch (source) {
      case StorageMode.Local:
        this._localFolderDriverService.updateFolder(f)
      case StorageMode.Cloud:
        return
    }
  }

  removeFolder(source: StorageMode, f: Folder) {
    switch (source) {
      case StorageMode.Local:
        this._localFolderDriverService.removeFolder(f)
      case StorageMode.Cloud:
        return
    }
  }

  /**
   * Supprime récursivement un dossier et les notes qu'il contient
   * @param source Source de donnée
   * @param folderToRemove Dossier à supprimer
   * @param noteList Liste CONSTANTE des arrays (copie de la vraie liste qui sera modifiée)
   * @param folderList Liste CONSTANTE des folderList (même chose)
   */
  removeFolderRecursive(source: StorageMode, folderToRemove: Folder, noteList: NoteMetadata[], folderList: Folder[]) {
    switch (source) {
      case StorageMode.Local:
        // Remove sub notes
        // noteList.filter(n => folderToRemove.noteUUIDs.includes(n.uuid)).forEach(n => {
        //   // TODO: delete note
        // })
        // Remove sub folders
        folderList.forEach((f, index) => {
          // Si f dossier enfant
          if (f.parentFolder && f.parentFolder == folderToRemove.uuid) {
            console.log(`${f.uuid} a pour parent ${folderToRemove.uuid}`);
            // folderList.splice(index, 1)
            this.removeFolderRecursive(source, f, noteList, folderList)
          }
        })
        this._localFolderDriverService.removeFolder(folderToRemove)
      case StorageMode.Cloud:
        return
    }
  }

}
