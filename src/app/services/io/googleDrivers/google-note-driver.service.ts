import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { INoteDriver } from '../INoteDriver';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { Note } from '../../../types/Note';
import { JsonConvert, ValueCheckingMode } from "json2typescript";
import { v4 as uuidv4 } from 'uuid';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';

type GoogleAuth = gapi.auth2.GoogleAuth;


@Injectable({
  providedIn: 'root'
})
export class GoogleNoteDriver implements INoteDriver {

  // Google auth instance
  googleAuth: GoogleAuth

  /**
   * Cache of note metadatas, SHOULD always be un sync with filesystem
   * because there is no function to write the whole cache to FS
   */
  private _listNotesSubject = new BehaviorSubject<NoteMetadata[]>([])

  constructor(private _googleAuthService: GoogleAuthService, 
    private gapiService: GoogleApiService) {
    // Wait for google api to deliver auth object
    this._googleAuthService.getAuth().subscribe(auth => {
      this.googleAuth = auth
    })
  }

  getListNotes(): Observable<NoteMetadata[]> {
    return this._listNotesSubject.asObservable()
  }
  refreshListNotes() {
    console.log('Refreshing drive notes ...')
    this.gapiService.onLoad().subscribe(()=> {
      // this.google.drive("v3").files.list().then(files => {
      //   console.log(files)
      // })
    });
    // const drive = this.google.drive({version: 'v3', auth})
  }
  getNote(uuid: string): Observable<Note> {
    throw new Error('Method not implemented.');
  }
  saveNote(note: Note): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }
  createNote(title?: string): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }
  saveMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata> {
    throw new Error('Method not implemented.');
  }
  removeNote(n: NoteMetadata): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private init() {

  }
  
}
