import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialog } from './components/confirmation-dialog/confirmation-dialog';
import { PageHeader } from './components/page-header/page-header';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';

@NgModule({
  declarations: [ConfirmationDialog, PageHeader, LoadingSpinner],
  imports: [CommonModule],
})
export class SharedModule {}
