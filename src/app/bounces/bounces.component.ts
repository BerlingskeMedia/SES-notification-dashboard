import { Component, OnInit } from '@angular/core';
import Notification, {NotificationData} from "../models/notification";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router, UrlSerializer} from "@angular/router";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-bounces',
  templateUrl: './bounces.component.html',
  styleUrls: ['./bounces.component.scss']
})
export class BouncesComponent implements OnInit {
  title = 'getBounces';
  public data: NotificationData = {}
  constructor(private httpClient: HttpClient, private router: Router, private serializer: UrlSerializer) { }

  ngOnInit(): void {
  }

  getData(formData): void {
    const tree = this.router.createUrlTree(
      ['/getBounces'], {
        queryParamsHandling: "merge",
        queryParams: formData
    });
    const query = this.serializer.serialize(tree);
    this.fetch(query).then((notifications) => {
      this.data = notifications;
    });
  }

  private async fetch(query: string): Promise<NotificationData>{
    const id_token = JSON.parse(sessionStorage.getItem('id_token'));
    return this.httpClient.get<NotificationData>(`${environment.appUrl}/api${query}`,
      { headers: {'Authorization': id_token}}
    ).toPromise();
  }

}
