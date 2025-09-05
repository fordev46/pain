import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlanComponent } from './plan/plan.component';
import { SalonsListComponent } from './salons-list/salons-list.component';
import { ButtonComponent } from './shared/button/button.component';

@NgModule({
  declarations: [AppComponent, PlanComponent, SalonsListComponent, ButtonComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ScrollingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
