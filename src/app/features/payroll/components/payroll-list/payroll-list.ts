import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Payroll, PaymentStatus } from '../../../../core/models/payroll.model';
import { errorMessage } from '../../../../core/utils/form.utils';
import { PayrollService } from '../../services/payroll';

@Component({
  selector: 'app-payroll-list',
  standalone: false,
  templateUrl: './payroll-list.html',
})
export class PayrollList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly payrollService = inject(PayrollService);
  private readonly messages = inject(MessageService);

  readonly records = signal<Payroll[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly generateVisible = signal(false);
  readonly generating = signal(false);
  readonly statusVisible = signal(false);
  readonly updatingStatus = signal(false);
  private selected: Payroll | null = null;

  readonly paymentStatuses: { label: string; value: PaymentStatus }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
  ];

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly generateForm = this.fb.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1)]],
    payrollPeriodId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly statusForm = this.fb.nonNullable.group({
    paymentStatus: ['PENDING' as PaymentStatus, Validators.required],
  });

  ngOnInit(): void {
    this.load();
    this.employeeFilter.valueChanges.subscribe(() => this.load());
  }

  load(): void {
    const employeeId = this.employeeFilter.value;
    const request$ =
      employeeId === null ? this.payrollService.list() : this.payrollService.listForEmployee(employeeId);

    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (rows) => {
        this.records.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load payroll.'));
        this.loading.set(false);
      },
    });
  }

  clearFilter(): void {
    this.employeeFilter.setValue(null);
  }

  openGenerate(): void {
    this.generateForm.reset({ employeeId: 0, payrollPeriodId: 0 });
    this.generateVisible.set(true);
  }

  generate(): void {
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }
    const { employeeId, payrollPeriodId } = this.generateForm.getRawValue();
    this.generating.set(true);
    this.payrollService.generate(employeeId, payrollPeriodId).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Generated', detail: 'Payroll generated.' });
        this.generateVisible.set(false);
        this.generating.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not generate payroll.') });
        this.generating.set(false);
      },
    });
  }

  openStatus(row: Payroll): void {
    this.selected = row;
    this.statusForm.reset({ paymentStatus: row.paymentStatus });
    this.statusVisible.set(true);
  }

  updateStatus(): void {
    if (!this.selected) {
      return;
    }
    const { paymentStatus } = this.statusForm.getRawValue();
    this.updatingStatus.set(true);
    this.payrollService.updatePaymentStatus(this.selected.payrollId, paymentStatus).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Payment status updated.' });
        this.statusVisible.set(false);
        this.updatingStatus.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not update status.') });
        this.updatingStatus.set(false);
      },
    });
  }
}
