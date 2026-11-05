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
  readonly loadingGenerateOptions = signal(false);
  readonly generateError = signal<string | null>(null);
  readonly periodOptions = signal<{ label: string; value: number }[]>([]);
  readonly statusVisible = signal(false);
  readonly updatingStatus = signal(false);
  readonly periodVisible = signal(false);
  readonly creatingPeriod = signal(false);
  readonly periodError = signal<string | null>(null);
  private selected: Payroll | null = null;

  readonly paymentStatuses: { label: string; value: PaymentStatus }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly generateForm = this.fb.group({
    employeeId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]),
    payrollPeriodId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  readonly statusForm = this.fb.nonNullable.group({
    paymentStatus: ['PENDING' as PaymentStatus, Validators.required],
  });

  readonly periodForm = this.fb.nonNullable.group({
    periodName: ['', [Validators.required, Validators.pattern(/\S/)]],
    startDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
    endDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
    status: ['', [Validators.required, Validators.pattern(/\S/)]],
  }, {
    validators: (control) => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
    },
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

  openCreatePeriod(): void {
    this.periodForm.reset();
    this.periodError.set(null);
    this.periodVisible.set(true);
  }

  createPeriod(): void {
    if (this.creatingPeriod()) return;
    if (this.periodForm.invalid) {
      this.periodForm.markAllAsTouched();
      return;
    }
    const value = this.periodForm.getRawValue();
    const body = { ...value, periodName: value.periodName.trim(), status: value.status.trim() };
    this.creatingPeriod.set(true);
    this.periodError.set(null);
    this.payrollService.createPeriod(body).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Added', detail: 'Payroll period added.' });
        this.periodVisible.set(false);
        this.creatingPeriod.set(false);
      },
      error: (err) => {
        this.periodError.set(errorMessage(err, 'Could not add payroll period.'));
        this.creatingPeriod.set(false);
      },
    });
  }

  openGenerate(): void {
    this.generateForm.reset();
    this.generateVisible.set(true);
    this.loadGenerateOptions();
  }

  loadGenerateOptions(): void {
    if (this.loadingGenerateOptions()) return;
    this.generateForm.reset();
    this.periodOptions.set([]);
    this.generateError.set(null);
    this.loadingGenerateOptions.set(true);
    this.payrollService.listPeriods().subscribe({
      next: (periods) => {
        this.periodOptions.set(periods.map((period) => ({
          label: `${period.periodName} (${period.startDate} - ${period.endDate})`,
          value: period.id,
        })));
        this.loadingGenerateOptions.set(false);
      },
      error: (err) => {
        this.generateError.set(errorMessage(err, 'Could not load payroll periods.'));
        this.loadingGenerateOptions.set(false);
      },
    });
  }

  generate(): void {
    if (this.generating() || this.loadingGenerateOptions() || this.generateError()) return;
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }
    const { employeeId, payrollPeriodId } = this.generateForm.getRawValue();
    if (employeeId === null || payrollPeriodId === null) return;
    if (!this.periodOptions().some((option) => option.value === payrollPeriodId)) {
      this.generateError.set('Select a payroll period from the available options.');
      return;
    }
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
    if (!this.selected || this.statusForm.invalid || this.updatingStatus()) {
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
