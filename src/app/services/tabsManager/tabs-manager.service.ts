import { Injectable } from '@angular/core';
import { IoService } from '../io/io.service';
import { StorageMode } from '../io/StorageMode';
import { NoteTab } from './NoteTab';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Note } from '../../types/Note';

@Injectable({
  providedIn: 'root'
})
export class TabsManagerService {

  _editedNoteUuid: BehaviorSubject<string> = new BehaviorSubject<string>("")
  /**
   * Currently edited note
   */
  readonly editedNoteObservable: Observable<string> = this._editedNoteUuid.asObservable()

  _openedNotes: BehaviorSubject<NoteTab[]> = new BehaviorSubject<NoteTab[]>([])
  /**
   * Notes opened in tabs
   */
  readonly openedNotesObservable: Observable<NoteTab[]> = this._openedNotes.asObservable()

  _alreadyOpened: Subject<NoteTab> = new Subject<NoteTab>()
  /**
   * Emits a note when a client asks to open a note that is already opened
   */
  readonly alreadyOpenedObservable: Observable<NoteTab> = this._alreadyOpened.asObservable()

  constructor(private _ioS: IoService) { }

  /**
   * Opens a new tab
   * @param uuid Note uuid
   */
  public open(uuid: string) {
    const alreadyOpenedTab: NoteTab | undefined = this._openedNotes.getValue().find(t=>t.savedNote.meta.uuid === uuid)
    // Si la note est déjà ouverte, on émet un évènement
    if (alreadyOpenedTab) {
      this._alreadyOpened.next(alreadyOpenedTab)
      return
    }
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

  /**
   * Permet au note-tabs component d'informer le manager que le client a changé d'onglet
   */
  public informTabChange(uuid: string) {
    this._editedNoteUuid.next(uuid)
  }

}
