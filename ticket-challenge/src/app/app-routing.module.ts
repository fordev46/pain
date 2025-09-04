import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalonsListComponent } from './salons-list/salons-list.component';
import { PlanComponent } from './plan/plan.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/salons',
    pathMatch: 'full'
  },
  {
    path: 'salons',
    component: SalonsListComponent
  },
  {
    path: 'plan/:mapId',
    component: PlanComponent
  },
  {
    path: '**',
    redirectTo: '/salons'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
