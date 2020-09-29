import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {

  constructor(private modal: NzModalRef) {}

  ngOnInit() { }

  /**
   * Destroys the modal
   * @param validateChanges saving changes ?
   */
  destroyModal(): void {
    this.modal.destroy();
  }

}
