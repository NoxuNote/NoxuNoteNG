import { Injectable, OnInit } from '@angular/core';
import { IoService } from '../io/io.service';
import { StorageMode } from '../io/StorageMode';
import { NoteTab } from './NoteTab';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Note } from '../../types/Note';
import { debounce, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TabsManagerService implements OnInit {

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

  constructor(private _ioS: IoService) {
    // When metadatas changes
    this._ioS.getListNotes(StorageMode.Local).pipe(debounceTime(100)).subscribe(notes => {
      let tabs: NoteTab[] = this._openedNotes.getValue()
      // Removing unused tabs
      let uuids = notes.map(n=>n.uuid)
      tabs = tabs.filter(t=>uuids.includes(t.savedNote.meta.uuid))
      // Update tabs data
      tabs.forEach((tab, index) => {
        // Find corresponding note meta
        let noteMeta = notes.find(n=>n.uuid==tab.savedNote.meta.uuid)
        // Update
        tabs[index].savedNote.meta = noteMeta
      })
      // Push new tabs values
      this._openedNotes.next(tabs)
    })
  }
  
  ngOnInit(): void {
    
  }

  /**
   * Opens a new tab
   * @param uuid Note uuid
   * @param storage l'espace de stockage
   */
  public open(uuid: string, storage: StorageMode) {
    const alreadyOpenedTab: NoteTab | undefined = this._openedNotes.getValue().find(t=>t.savedNote.meta.uuid === uuid)
    // Si la note est déjà ouverte, on émet un évènement
    if (alreadyOpenedTab) {
      this._alreadyOpened.next(alreadyOpenedTab)
      return
    }
    this._ioS.getNote(storage, uuid).toPromise().then(n=>this.append(n))
  }

  /**
   * Closes a tab
   * @param uuid Note uuid
   */
  public close(uuid: string) {
    if (!this._openedNotes.getValue().find(n=>n.savedNote.meta.uuid==uuid)) return
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
