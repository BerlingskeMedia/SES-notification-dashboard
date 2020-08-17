import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-zaby',
  templateUrl: './zaby.component.html',
  styleUrls: ['./zaby.component.scss']
})
export class ZabyComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
  }

  public async send() {
      this.httpClient.get('www.google.com').toPromise().then(console.log)
  }

}
