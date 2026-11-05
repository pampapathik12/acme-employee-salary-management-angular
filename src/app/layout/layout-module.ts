import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { MainLayout } from './main-layout/main-layout';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Footer } from './footer/footer';

@NgModule({
  declarations: [MainLayout, Sidebar, Header, Footer],
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule, TagModule],
})
export class LayoutModule {}
