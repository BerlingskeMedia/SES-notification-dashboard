import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { ZabyComponent } from './zaby/zaby.component';
import {HttpClientModule} from "@angular/common/http";
import { BouncesComponent } from './bounces/bounces.component';
import { HeaderComponent } from './header/header.component';
import { DashboardFormComponent } from './dashboard-form/dashboard-form.component';
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    ZabyComponent,
    BouncesComponent,
    HeaderComponent,
    DashboardFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
