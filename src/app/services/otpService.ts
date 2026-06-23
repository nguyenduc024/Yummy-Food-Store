import { findUserByPhone } from './authStorage';

const OTP_KEY = 'yummy_otp';
const OTP_TTL_MS = 5 * 60 * 1000;

interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
}

function getOtpRecord(): OtpRecord | null {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOtpRecord(record: OtpRecord): void {
  sessionStorage.setItem(OTP_KEY, JSON.stringify(record));
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function sendOtp(phone: string): { success: boolean; code?: string; error?: string } {
  const user = findUserByPhone(phone);
  if (!user) {
    return { success: false, error: 'Không tìm thấy tài khoản với số điện thoại này' };
  }

  const code = generateCode();
  saveOtpRecord({
    phone,
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  return { success: true, code };
}

export function verifyOtp(phone: string, inputCode: string): { valid: boolean; error?: string } {
  const record = getOtpRecord();

  if (!record || record.phone !== phone) {
    return { valid: false, error: 'Mã OTP không hợp lệ. Vui lòng gửi lại mã.' };
  }

  if (Date.now() > record.expiresAt) {
    return { valid: false, error: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã.' };
  }

  if (record.code !== inputCode.trim()) {
    return { valid: false, error: 'Mã OTP không đúng. Vui lòng thử lại.' };
  }

  return { valid: true };
}

export function clearOtp(): void {
  sessionStorage.removeItem(OTP_KEY);
}
