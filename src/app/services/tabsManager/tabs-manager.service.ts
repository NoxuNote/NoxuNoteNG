import { Injectable } from '@angular/core';
import { IoService } from '../io/io.service';
import { StorageMode } from '../io/StorageMode';
import { NoteTab } from './NoteTab';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../../types/Note';
import { timingSafeEqual } from 'crypto';
import { cpus } from 'os';

@Injectable({
  providedIn: 'root'
})
export class TabsManagerService {

  private _openedNotes: BehaviorSubject<NoteTab[]> = new BehaviorSubject<NoteTab[]>([]);
  public readonly openedNotesObservable: Observable<NoteTab[]> = this._openedNotes.asObservable();

  constructor(private _ioS: IoService) { }

  /**
   * Opens a new tab
   * @param uuid Note uuid
   */
  public open(uuid: string) {
    if (this._openedNotes.getValue().map(n=>n.savedNote.meta.uuid).includes(uuid)) return
    this._ioS.getNote(StorageMode.Local, uuid).toPromise().then(n=>this.append(n))
  }

  /**
   * Closes a tab
   * @param uuid Note uuid
   */
  public close(uuid: string) {
    if (!this._openedNotes.getValue().map(n=>n.savedNote.meta.uuid).includes(uuid)) return
    this.shift(uuid)
  }

  /**
   * Appends a tab to the list
   * @param note non opened note uuid
   */
  private append(note: Note) {
    this._openedNotes.next( [...this._openedNotes.getValue(), {savedNote: note}] )
  }

  /**
   * Removes a tab from list
   * @param uuid opened note uuid
   */
  private shift(uuid: string) {
    let tabs: NoteTab[] = this._openedNotes.getValue()
    const index = tabs.findIndex(t=>t.savedNote.meta.uuid === uuid)    
    tabs.splice(index, 1)
    this._openedNotes.next(tabs)
  } 

}
