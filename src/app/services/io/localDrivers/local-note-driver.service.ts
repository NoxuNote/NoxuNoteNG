import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { ElectronService } from '../../../core/services';

@Injectable({
  providedIn: 'root'
})
export class LocalNoteDriverService {

  constructor(private _elS: ElectronService) { }
  
  public listFiles(): Observable<string[]> {
    if (this._elS.isElectron) return from(this._elS.fs.readdir('C:/users/black/NoxuNoteNG/notes'))
    else return of([])
  }

  public writeFile(name:string) {
    if (this._elS.isElectron) {
      console.log("wrote "+ name)
      this._elS.fs.writeFileSync(name, "texte", {})
    }
  }

}
