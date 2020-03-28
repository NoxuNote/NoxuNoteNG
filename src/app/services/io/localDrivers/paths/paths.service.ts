import { Injectable } from '@angular/core';
import { ElectronService } from '../../../../core/services';
import { ParsedPath } from 'path';
import { pathExists } from 'fs-extra';

@Injectable({
  providedIn: 'root'
})
export class PathsService {

  constructor(private _elS: ElectronService) { 

  }

  getNotesFolder(): string {
    return this._elS.path.join(this.getNoxuNoteDir(), 'notes')
  }

  public getNoxuNoteDir(): string {
    return this._elS.path.join(this._elS.os.homedir(), 'NoxuNoteNG')
  }

}
