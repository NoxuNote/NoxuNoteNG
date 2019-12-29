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
    return this._elS.path.join(this.getHomeDir(), 'notes')
  }

  private getHomeDir(): string {
    return this._elS.path.parse(this._elS.os.homedir()).dir
  }

}
