import { describe, expect, it } from 'vitest';
import { validateContact } from '../../src/scripts/contact-core';

describe('validateContact', () => {
  it('requires name, email and message', () => {
    expect(validateContact({ name: ' ', email: '', type: 'freelance', message: '' })).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
    });
  });

  it('rejects an invalid email address', () => {
    expect(
      validateContact({ name: 'A', email: 'invalid', type: 'freelance', message: 'Hello there!' }),
    ).toEqual({ email: 'email' });
  });

  it('accepts valid values and trims whitespace for validation', () => {
    expect(
      validateContact({
        name: ' Ana ',
        email: ' ana@example.com ',
        type: 'freelance',
        message: ' Hello there! ',
      }),
    ).toEqual({});
  });
});
