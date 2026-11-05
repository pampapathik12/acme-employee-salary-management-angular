import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './components/dashboard/dashboard';

@NgModule({
  declarations: [Dashboard],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
})
export class DashboardModule {}
