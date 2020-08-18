import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router, UrlSerializer} from "@angular/router";
import Notification from "../models/notification";

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss']
})
export class ComplaintsComponent implements OnInit {

  public data: any[] = []
  constructor(private httpClient: HttpClient, private router: Router, private serializer: UrlSerializer) { }

  ngOnInit(): void {
  }

  getData(formData) {
    const tree = this.router.createUrlTree(['/getComplaints'], { queryParamsHandling: "merge",queryParams: formData });
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
