import { Injectable } from '@angular/core';
import { NoteMetadata as NoteTab } from '../../types/NoteMetadata';
import { IoService } from '../io/io.service';
import { StorageMode } from '../io/StorageMode';

@Injectable({
  providedIn: 'root'
})
export class TabsManagerService {

  constructor(private _ioS: IoService) { }

  openedNotes: NoteTab[] = []
  
  /**
   * Opens a new tab
   * @param uuid Note uuid
   */
  public open(uuid: string) {
    this._ioS.getNote(StorageMode.Local, uuid)
  }

}
