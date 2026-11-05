import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaryList } from './components/salary-list/salary-list';

const routes: Routes = [{ path: '', component: SalaryList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalaryStructureRoutingModule {}
