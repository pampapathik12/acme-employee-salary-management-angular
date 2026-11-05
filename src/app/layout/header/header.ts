import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/services/auth';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly auth = inject(Auth);

  logout(): void {
    this.auth.logout();
  }
}
