import { Injectable } from '@angular/core'
import { GoogleApiService, GoogleAuthService } from 'ng-gapi'
import { BehaviorSubject } from 'rxjs';
type GoogleUser = gapi.auth2.GoogleUser;
type GoogleAuth = gapi.auth2.GoogleAuth;

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  private auth: GoogleAuth;

  constructor(private googleAuth: GoogleAuthService) {
    this.googleAuth.getAuth().subscribe(auth => this.auth = auth)
  }

  signIn() {
    this.auth.signIn().then(res => this.signInSuccessHandler(res));
  }

  public getToken(): string {
    let token: string = sessionStorage.getItem("GOOGLEAPIS_ACCESS_TOKEN");
    if (!token) throw new Error("no token set , authentication required");
    return sessionStorage.getItem("GOOGLEAPIS_ACCESS_TOKEN");
  }

  private signInSuccessHandler(res: GoogleUser) {
    sessionStorage.setItem("GOOGLEAPIS_ACCESS_TOKEN", res.getAuthResponse().access_token)
  }

}
