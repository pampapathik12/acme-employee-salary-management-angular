import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DepartmentsRoutingModule } from './departments-routing-module';
import { DepartmentList } from './components/department-list/department-list';

@NgModule({
  declarations: [DepartmentList],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DepartmentsRoutingModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TooltipModule,
  ],
})
export class DepartmentsModule {}
