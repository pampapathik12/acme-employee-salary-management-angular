import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SalaryStructureRoutingModule } from './salary-structure-routing-module';
import { SalaryList } from './components/salary-list/salary-list';

@NgModule({
  declarations: [SalaryList],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SalaryStructureRoutingModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TooltipModule,
  ],
})
export class SalaryStructureModule {}
