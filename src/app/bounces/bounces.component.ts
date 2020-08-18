import { Component, OnInit } from '@angular/core';
import Notification from "../models/notification";
import { HttpClient } from "@angular/common/http";
import {Router, UrlSerializer} from "@angular/router";

@Component({
  selector: 'app-bounces',
  templateUrl: './bounces.component.html',
  styleUrls: ['./bounces.component.scss']
})
export class BouncesComponent implements OnInit {
  title = 'getBounces';
  public data: any[] = []
  constructor(private httpClient: HttpClient, private router: Router, private serializer: UrlSerializer) { }

  ngOnInit(): void {
  }

  getData(formData) {
    const tree = this.router.createUrlTree(['/getBounces'], { queryParamsHandling: "merge",queryParams: formData });
    const query = this.serializer.serialize(tree);
    this.fetch(query).then((notifications) => {
      this.data = notifications;
    });
  }

  private async fetch(query: string): Promise<Notification[]>{
   return this.httpClient.get<Notification[]>(`http://localhost:3000/api${query}`)
     .toPromise();
  }

}
