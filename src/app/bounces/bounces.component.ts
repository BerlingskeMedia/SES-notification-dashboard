import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bounces',
  templateUrl: './bounces.component.html',
  styleUrls: ['./bounces.component.scss']
})
export class BouncesComponent implements OnInit {
  public data: any[] = []
  constructor() { }

  ngOnInit(): void {
  }

  getData(from: Date) {
    //
    console.log('bounces get Data', from)
    this.data = ['a', 'b'];
  }

}
