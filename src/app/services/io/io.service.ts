import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { StorageMode } from './StorageMode';
import fs = require('fs-extra');
import { LocalNoteDriverService } from './localDrivers/local-note-driver.service';


@Injectable({
  providedIn: 'root'
})
export class IoService {

  public mode: BehaviorSubject<StorageMode> = new BehaviorSubject<StorageMode>(StorageMode.Cloud);

  constructor(private _localNoteDriverService: LocalNoteDriverService) { }

  listFiles(): Observable<string[]> {
    switch (this.mode.getValue()) {
      case StorageMode.Local:
        return this._localNoteDriverService.listFiles()
        break;
      case StorageMode.Cloud:
        return of(["cloud1", "cloud2"])
        break;
    }
  }

  writeFile() {
    const path = "C:/Users/black/NoxuNoteNG/notes/note.html"
    switch (this.mode.getValue()) {
      case StorageMode.Local:
        this._localNoteDriverService.writeFile(path)
        break;
      case StorageMode.Cloud:
        break;
    }
  }

  setMode(mode: StorageMode) {
    this.mode.next(mode);
  }

}
