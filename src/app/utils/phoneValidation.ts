export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const trimmed = phone.trim();

  if (!trimmed) {
    return { valid: false, error: 'Vui lòng nhập số điện thoại' };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Số điện thoại chỉ được chứa chữ số' };
  }

  if (trimmed.length !== 10) {
    return { valid: false, error: 'Số điện thoại phải có đúng 10 chữ số' };
  }

  return { valid: true };
}

export function formatPhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}
