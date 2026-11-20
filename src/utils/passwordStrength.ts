export interface PasswordStrengthResult {
  level: 0 | 1 | 2 | 3;
  label: string;
}

/**
 * Evaluates password strength across 3 clear levels for the registration form.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { level: 0, label: '' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 6 || score <= 1) {
    return { level: 1, label: 'Yếu' };
  }
  if (score <= 3) {
    return { level: 2, label: 'Trung bình' };
  }
  return { level: 3, label: 'Mạnh' };
}
