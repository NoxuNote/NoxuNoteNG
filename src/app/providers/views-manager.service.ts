import { Injectable } from '@angular/core';
import { Observable, Subscribable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewsManagerService {

  /**
   * Defines if the left save menu is Opened or not
   * Default value : false
   */
  private _isSaveMenuOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isSaveMenuOpenedObservable: Observable<boolean> = this._isSaveMenuOpened.asObservable();

  constructor() { 
  }

  public openSaveMenu() {
    this._isSaveMenuOpened.next(true);
  }
  public closeSaveMenu() {
    this._isSaveMenuOpened.next(false);
  }
  public toggleSaveMenu() {
    this._isSaveMenuOpened.next(!this._isSaveMenuOpened.getValue())
  }

}
