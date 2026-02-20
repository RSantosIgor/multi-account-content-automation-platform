import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './crypto.js';

describe('crypto', () => {
  it('encrypt/decrypt roundtrip returns original plaintext', () => {
    const plaintext = 'my-secret-oauth-token-12345';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('each encrypt call produces a different ciphertext (random IV)', () => {
    const plaintext = 'same-value';
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);

    expect(a).not.toBe(b);

    // Both decrypt to the same value
    expect(decrypt(a)).toBe(plaintext);
    expect(decrypt(b)).toBe(plaintext);
  });

  it('handles empty string', () => {
    const encrypted = encrypt('');
    expect(decrypt(encrypted)).toBe('');
  });

  it('handles unicode characters', () => {
    const plaintext = 'token-with-émojis-🚀-and-日本語';
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it('throws on tampered ciphertext', () => {
    const encrypted = encrypt('secret');
    // Flip a byte in the middle of the ciphertext
    const tampered = encrypted.slice(0, encrypted.length - 4) + 'ffff';

    expect(() => decrypt(tampered)).toThrow();
  });
});
