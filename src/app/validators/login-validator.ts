import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);

    const passwordValid = hasMinLength && hasUpperCase && hasNumber;

    return !passwordValid ? { passwordStrength: true } : null;
  };
}