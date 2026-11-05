import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DesignationsRoutingModule } from './designations-routing-module';
import { DesignationList } from './components/designation-list/designation-list';

@NgModule({
  declarations: [DesignationList],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DesignationsRoutingModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TooltipModule,
  ],
})
export class DesignationsModule {}
