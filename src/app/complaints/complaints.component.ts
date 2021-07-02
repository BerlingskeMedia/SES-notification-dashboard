import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router, UrlSerializer} from '@angular/router';
import {NotificationData} from '../models/notification';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss']
})
export class ComplaintsComponent implements OnInit {

  public data: NotificationData = {};
  constructor(private httpClient: HttpClient, private router: Router, private serializer: UrlSerializer) { }

  ngOnInit(): void {
  }

  getData(formData): void {
    const tree = this.router.createUrlTree(['/getComplaints'], { queryParamsHandling: 'merge', queryParams: formData });
    const query = this.serializer.serialize(tree);
    this.fetch(query).then((notifications) => {
      this.data = notifications;
    });
  }

  private async fetch(query: string): Promise<NotificationData> {
    const idToken = JSON.parse(sessionStorage.getItem('id_token'));
    return this.httpClient.get<NotificationData>(`${environment.appUrl}/api${query}`,
      { headers: {Authorization: idToken}}
      ).toPromise();
  }

}
