import { Component, OnInit } from '@angular/core';
import { AuthService, DriveService } from '../../../services';

@Component({
  selector: 'app-login-buttons',
  templateUrl: './login-buttons.component.html',
  styleUrls: ['./login-buttons.component.css']
})
export class LoginButtonsComponent {

  constructor(private _authService: AuthService, private _driveService: DriveService) { }

  triggerLogin(service: string) {
    switch (service) {
      case "noxunote":
        this._authService.openModal()
        break;
      case "drive":
        this._driveService.signIn()
        break;
    }
  }

}
