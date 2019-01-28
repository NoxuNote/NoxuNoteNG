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

  /**
   * Defines if the left open menu is Opened or not
   * Default value : false
   */
  private _isBrowseMenuOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isBrowseMenuOpenedObservable: Observable<boolean> = this._isBrowseMenuOpened.asObservable();

  constructor() { 
  }

  /**
   * Left save menu methods
   */
  public openSaveMenu() {
    this._isSaveMenuOpened.next(true);
    this._isBrowseMenuOpened.next(false);
  }
  public closeSaveMenu() {
    this._isSaveMenuOpened.next(false);
    this._isBrowseMenuOpened.next(true);
  }
  public toggleSaveMenu() {
    this._isSaveMenuOpened.next(!this._isSaveMenuOpened.getValue())
    this._isBrowseMenuOpened.next(false);
  }

  /**
   * Left open/browse menu methods
   */
  public openBrowseMenu() {
    this._isBrowseMenuOpened.next(true);
  }
  public closeBrowseMenu() {
    this._isBrowseMenuOpened.next(false);
  }
  public toggleBrowseMenu() {
    this._isBrowseMenuOpened.next(!this._isBrowseMenuOpened.getValue())
    this._isSaveMenuOpened.next(false);
  }

}
