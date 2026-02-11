import { CryptoUtil } from './crypto.util';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env for tests
dotenv.config({ path: path.join(__dirname, '../../.env') });

describe('CryptoUtil', () => {
    const plaintext = 'secretpassword';

    it('should encrypt correctly', () => {
        const encrypted = CryptoUtil.encrypt(plaintext);
        expect(encrypted).not.toBe(plaintext);
        expect(encrypted).toContain(':');
    });

    it('should be non-deterministic (different IVs)', () => {
        const encrypted1 = CryptoUtil.encrypt(plaintext);
        const encrypted2 = CryptoUtil.encrypt(plaintext);
        expect(encrypted1).not.toBe(encrypted2);
    });

    it('should compare correctly', () => {
        const encrypted = CryptoUtil.encrypt(plaintext);
        expect(CryptoUtil.compare(plaintext, encrypted)).toBe(true);
        expect(CryptoUtil.compare('wrongpassword', encrypted)).toBe(false);
    });
});
