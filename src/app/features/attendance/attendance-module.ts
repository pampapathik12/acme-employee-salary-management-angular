import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AttendanceRoutingModule } from './attendance-routing-module';
import { AttendanceList } from './components/attendance-list/attendance-list';

@NgModule({
  declarations: [AttendanceList],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AttendanceRoutingModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TooltipModule,
  ],
})
export class AttendanceModule {}
