import { Injectable, OnInit } from '@angular/core';
import { IoService } from '../io/io.service';
import { StorageMode } from '../io/StorageMode';
import { NoteTab } from './NoteTab';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Note } from '../../types/Note';
import { debounce, debounceTime, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TabsManagerService {

  _editedNote: BehaviorSubject<NoteTab> = new BehaviorSubject<NoteTab>(null)
  /**
   * Notes opened in tabs
   */
   readonly editedNoteObservable: Observable<NoteTab> = this._editedNote.asObservable()

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
      // // Close tabs for notes that have been deleted
      // ==== Functionnality removed because it closes all tabs of other storagemodes ====
      // let uuids = notes.map(n=>n.uuid)
      // tabs = tabs.filter(t=>uuids.includes(t.savedNote.meta.uuid))
      // Update tabs data
      notes.forEach(note => {
        let tab = tabs.find(t => t.noteUUID == note.uuid)
        if (tab) tab.title = note.title
      })
      // Push new tabs values
      this._openedNotes.next(tabs)
    })
  }

  public readLocalStorage() {
    const openedNotesStorage = localStorage.getItem("openedNotes")
    const editedNoteUuid = localStorage.getItem("editedNoteUuid")
    if (!openedNotesStorage || !editedNoteUuid) return
    const openedNotes: NoteTab[] = JSON.parse(openedNotesStorage)
    const editedNote = openedNotes.find(n => n.noteUUID == editedNoteUuid)
    this._openedNotes.next(openedNotes)
    this._editedNote.next(editedNote)
  }


  /**
   * Opens a new tab
   */
  public open(newTab: NoteTab) {
    const alreadyOpenedTab: NoteTab | undefined = this._openedNotes.getValue().find(t=>t.noteUUID === newTab.noteUUID)
    // Si la note est déjà ouverte, on émet un évènement
    if (alreadyOpenedTab) {
      this._alreadyOpened.next(alreadyOpenedTab)
      return
    }
    this.updateOpenedNotes([...this._openedNotes.getValue(), newTab])
  }

  /**
   * Closes a tab
   * @param uuid Note uuid
   */
  public close(uuid: string) {
    let tabs: NoteTab[] = this._openedNotes.getValue()
    const index = tabs.findIndex(t=>t.noteUUID === uuid)    
    if (index == -1) return
    tabs.splice(index, 1)
    this.updateOpenedNotes(tabs)
  }

  /**
   * Updates the current value of the OpenedNotes Observable
   * and the localStorage
   * @param notes The new opened notes list
   */
  private updateOpenedNotes(notes: NoteTab[]) {
    this._openedNotes.next(notes)
    localStorage.setItem("openedNotes", JSON.stringify(notes))
  }

  /**
   * Permet au note-tabs component d'informer le manager que le client a changé d'onglet
   */
  public informTabChange(uuid: string) {
    this._editedNote.next(this._openedNotes.getValue().find(n => n.noteUUID == uuid))
    localStorage.setItem("editedNoteUuid", uuid)
  }

}
