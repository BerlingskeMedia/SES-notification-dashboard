import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { BouncesComponent } from './bounces/bounces.component';
import { HeaderComponent } from './header/header.component';
import { DashboardFormComponent } from './dashboard-form/dashboard-form.component';
import {ReactiveFormsModule} from '@angular/forms';
import { ComplaintsComponent } from './complaints/complaints.component';
import { LoginComponent } from './google/login/login.component';
import { ToastComponent } from './components/toast/toast.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    BouncesComponent,
    HeaderComponent,
    DashboardFormComponent,
    ComplaintsComponent,
    LoginComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
