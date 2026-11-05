import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollList } from './components/payroll-list/payroll-list';

const routes: Routes = [{ path: '', component: PayrollList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollRoutingModule {}
