export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = (err as { error?: { message?: string } } | null)?.error;
  if (typeof body?.message === 'string' && body.message) {
    return body.message;
  }
  return fallback;
}

export function toIsoDate(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromIsoDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
