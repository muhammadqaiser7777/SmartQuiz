import * as crypto from 'crypto';

export class CryptoUtil {
    private static readonly ALGORITHM = 'aes-256-cbc';

    // Properly derive 32-byte key from a plain string in .env
    private static get KEY(): Buffer {
        if (!process.env.ADMIN_KEY) {
            throw new Error('ADMIN_KEY not set in .env');
        }
        // Derive 32-byte key using SHA-256
        return crypto.createHash('sha256').update(process.env.ADMIN_KEY).digest();
    }

    static encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    static compare(plainText: string, storedHash: string): boolean {
        try {
            const [ivHex, encrypted] = storedHash.split(':');
            if (!ivHex || !encrypted) return false;

            const iv = Buffer.from(ivHex, 'hex');
            const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
            let checkEncrypted = cipher.update(plainText, 'utf8', 'hex');
            checkEncrypted += cipher.final('hex');

            return checkEncrypted === encrypted;
        } catch (error) {
            return false;
        }
    }
}
