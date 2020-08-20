import { Component, OnInit } from '@angular/core';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() {
    (window as any).onSignIn = this.onSignIn.bind(this);
  }

  ngOnInit(): void {
  }

  public onSignIn(googleUser) {
    const { id_token } = googleUser.getAuthResponse();
    this.send(id_token)
  }

  private send(id_token: string) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `${environment.appUrl}/api/tokensignin`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
      sessionStorage.setItem('id_token', JSON.stringify(id_token))
    };
    xhr.send('id_token=' + id_token);
  }
}
