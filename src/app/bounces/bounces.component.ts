import { Component, OnInit } from '@angular/core';
import Notification, {NotificationData} from '../models/notification';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router, UrlSerializer} from '@angular/router';
import { environment } from '../../environments/environment';
import {ToastService} from '../services/toast.service';

@Component({
  selector: 'app-bounces',
  templateUrl: './bounces.component.html',
  styleUrls: ['./bounces.component.scss']
})
export class BouncesComponent implements OnInit {
  title = 'getBounces';
  public data: NotificationData = {};
  constructor(
    private httpClient: HttpClient, private router: Router, private serializer: UrlSerializer, private toastService: ToastService
  ) { }

  ngOnInit(): void {
  }

  getData(formData): void {
    const tree = this.router.createUrlTree(
      ['/getBounces'], {
        queryParamsHandling: 'merge',
        queryParams: formData
    });
    const query = this.serializer.serialize(tree);
    this.fetch(query).then((notifications) => {
      this.data = notifications;
    })
      .catch(() => {
        this.router.navigateByUrl('/').then(() =>
          this.toastService.addDanger('You are not authorized to use this page, please login'));

      });
  }

  private async fetch(query: string): Promise<NotificationData>{
    const idToken = JSON.parse(sessionStorage.getItem('id_token'));
    if (!idToken) {
      throw new Error('Unauthorized');
    }

    return this.httpClient.get<NotificationData>(`${environment.appUrl}/api${query}`,
      { headers: {Authorization: idToken}}
    ).toPromise();
  }

}
