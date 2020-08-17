import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from "./app.component";
import {BouncesComponent} from "./bounces/bounces.component";

const routes: Routes = [
  {
    path: '*',
    component: AppComponent
  }, {
    path: 'bounces',
    component: BouncesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
