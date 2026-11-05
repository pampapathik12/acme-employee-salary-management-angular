import { Component, inject } from '@angular/core';
import { Loading } from '../../../core/services/loading';

@Component({
  selector: 'app-loading-spinner',
  standalone: false,
  styleUrl: './loading-spinner.css',
  templateUrl: './loading-spinner.html',
})
export class LoadingSpinner {
  protected readonly isSpinning = inject(Loading).isSpinning;
}
