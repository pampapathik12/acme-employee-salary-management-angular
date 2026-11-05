import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignationList } from './components/designation-list/designation-list';

const routes: Routes = [{ path: '', component: DesignationList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesignationsRoutingModule {}
