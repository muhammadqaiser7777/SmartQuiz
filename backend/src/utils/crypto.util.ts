import * as crypto from 'crypto';

export class CryptoUtil {
    private static readonly ALGORITHM = 'aes-256-cbc';
    private static get KEY(): Buffer {
        return Buffer.from(process.env.ADMIN_KEY!, 'hex');
    }

    private static readonly IV = Buffer.alloc(16, 0);

    static encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, this.IV);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
}
