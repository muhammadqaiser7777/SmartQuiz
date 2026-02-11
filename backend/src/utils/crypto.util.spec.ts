import { CryptoUtil } from './crypto.util';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Mock process.env for the test
dotenv.config({ path: path.join(__dirname, '../../.env') });

describe('CryptoUtil', () => {
    const plaintext = 'secretpassword';

    it('should encrypt correctly', () => {
        const encrypted = CryptoUtil.encrypt(plaintext);
        expect(encrypted).not.toBe(plaintext);
    });

    it('should produce consistent encryption for matching', () => {
        const encrypted1 = CryptoUtil.encrypt(plaintext);
        const encrypted2 = CryptoUtil.encrypt(plaintext);
        expect(encrypted1).toBe(encrypted2);
    });
});
