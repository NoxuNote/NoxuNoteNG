import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { GoogleAuthService } from 'ng-gapi';
import { AuthService, DriveService } from '../../../services';
type GoogleUser   = gapi.auth2.GoogleUser;
type BasicProfile = gapi.auth2.BasicProfile;
type GoogleAuth = gapi.auth2.GoogleAuth;

@Component({
  selector: 'app-login-buttons',
  templateUrl: './login-buttons.component.html',
  styleUrls: ['./login-buttons.component.css']
})
export class LoginButtonsComponent {

  // Google auth instance
  googleAuth: GoogleAuth

  // Google profile informations
  isGoogleSignedIn = false
  googleUser: GoogleUser
  googleProfile: BasicProfile

  // Update Google profile informations
  updateInformations = signedIn => {
    this.isGoogleSignedIn = signedIn 
    if (signedIn) {
      this.googleUser = this.googleAuth.currentUser.get()
      this.googleProfile = this.googleUser.getBasicProfile()
    }
  }

  constructor(
    private _authService: AuthService, 
    private _driveService: DriveService,
    private _googleAuth: GoogleAuthService
  ) { 
    this._googleAuth.getAuth().subscribe(auth => {
      this.googleAuth = auth
      this.updateInformations(this.googleAuth.isSignedIn.get())
      this.googleAuth.isSignedIn.listen(this.updateInformations)
    })

  }

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
