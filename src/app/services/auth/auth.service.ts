import { Injectable } from '@angular/core';
import { getCookie } from './cookies'
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd';
import { AuthModalComponent } from './authModal/auth-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private hasSessionCookieSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public hasSessionCookieObservable: Observable<boolean> = this.hasSessionCookieSubject.asObservable()

  constructor(private _modalService: NzModalService) {
    this.refresh()
  }

  /**
   * @return true if there is a session cookie in browser
   */
  static hasSessionCookie(): boolean {
    return getCookie('ory_kratos_session') != ''
  }

  /**
   * Refresh the hasSessionCookie subject value
   */
  refresh() {
    this.hasSessionCookieSubject.next(AuthService.hasSessionCookie())
  }

  /**
   * Emits an openModal obserable new value
   * Home component should open a modal asking the user to login
   */
  openModal() {
    const modal = this._modalService.create({
      nzTitle: `Se connecter`,
      nzContent: AuthModalComponent,
      nzFooter: [
        {
          label: 'Fermer',
          onClick: componentInstance => componentInstance.destroyModal()
        }
      ]
    })
    modal.afterClose.subscribe(() => this.refresh())
  }


}
