import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from './main-layout/main-layout';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Footer } from './footer/footer';

@NgModule({
  declarations: [MainLayout, Sidebar, Header, Footer],
  imports: [CommonModule],
})
export class LayoutModule {}
