import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Service/API to ask the browser to do some browser-actions
 * such as create a folder, a note..
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  private _askCreateNoteSubject: Subject<void> = new Subject<void>()
  public readonly askCreateNoteObservable: Observable<void>

  private _askCreateFolderSubject = new Subject<void>()
  public readonly askCreateFolderObservable: Observable<void>

  constructor() {
    this.askCreateNoteObservable = this._askCreateNoteSubject.asObservable()
    this.askCreateFolderObservable = this._askCreateFolderSubject.asObservable()
  }

  askCreateNote() {
    console.debug('asking browser to create a note')
    this._askCreateNoteSubject.next()
  }
  
  askCreateFolder() {
    console.debug('asking browser to create a folder')
    this._askCreateFolderSubject.next()
  }

}
