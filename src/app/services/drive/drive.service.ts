import { Injectable } from '@angular/core'
import { GoogleAuthService } from 'ng-gapi'
type GoogleUser = gapi.auth2.GoogleUser;

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  

  private user: GoogleUser;

  constructor(private googleAuth: GoogleAuthService) { }

  /**
   * Open the Google OAuth login page for NoxuNote
   */
  signIn() {
    this.googleAuth.getAuth().subscribe(auth => {
      auth.signIn().then(res => this.signInSuccessHandler(res));
    });
  }

  public getToken(): string {
    let token: string = sessionStorage.getItem("GOOGLEAPIS_ACCESS_TOKEN");
    if (!token) throw new Error("no token set , authentication required");
    return sessionStorage.getItem("GOOGLEAPIS_ACCESS_TOKEN");
  }

  private signInSuccessHandler(res: GoogleUser) {
    this.user = res;
    sessionStorage.setItem("GOOGLEAPIS_ACCESS_TOKEN", res.getAuthResponse().access_token)
  }


}
