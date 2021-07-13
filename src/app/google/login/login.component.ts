import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

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

  public onSignIn(googleUser): void {
    const { id_token } = googleUser.getAuthResponse();
    this.send(id_token);
  }

  private send(idToken: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${environment.appUrl}/api/tokensignin`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = () => {
      sessionStorage.setItem('id_token', JSON.stringify(idToken));
    };
    xhr.send('id_token=' + idToken);
  }
}
