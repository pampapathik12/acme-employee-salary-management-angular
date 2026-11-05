import { Service, computed, signal } from '@angular/core';

@Service()
export class Loading {
  private readonly pendingRequests = signal(0);

  readonly isSpinning = computed(() => this.pendingRequests() > 0);

  start(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  stop(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}
