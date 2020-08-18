import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from "./app.component";
import {BouncesComponent} from "./bounces/bounces.component";
import {ComplaintsComponent} from "./complaints/complaints.component";

const routes: Routes = [
  {
    path: '*',
    component: AppComponent
  }, {
    path: 'bounces',
    component: BouncesComponent
  }, {
    path: 'complaints',
    component: ComplaintsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
