import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { isDevMode } from '@angular/core';
import {DomSanitizer,SafeResourceUrl,} from '@angular/platform-browser';


@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {

  loginUrl: SafeResourceUrl;

  constructor(private modal: NzModalRef, private sanitizer:DomSanitizer) {}

  ngOnInit() {
    let rawUrl = isDevMode() ? 'http://127.0.0.1:4455/' : 'https://cloud.noxunote.fr/'
    this.loginUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  /**
   * Destroys the modal
   * @param validateChanges saving changes ?
   */
  destroyModal(): void {
    this.modal.destroy();
  }

}
