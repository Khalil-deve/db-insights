/**
 * A simple utility for obfuscating/encrypting data in LocalStorage.
 * Note: This uses a static key for basic protection against casual inspection.
 * In a production app with true sensitive data, we would use a user-provided 
 * passphrase and SubtleCrypto for AES-GCM encryption.
 */

const SECRET_SALT = 'db-insights-v1-secure-salt';

export function encryptState(data: any): string {
    if (typeof window === 'undefined') return '';
    const json = JSON.stringify(data);
    // Convert to base64 with a simple XOR-like obfuscation
    const encoded = btoa(
        json.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
        ).join('')
    );
    return encoded;
}

export function decryptState(encoded: string): any {
    if (typeof window === 'undefined' || !encoded) return null;
    try {
        const decoded = atob(encoded);
        const json = decoded.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
        ).join('');
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to decrypt state:', e);
        return null;
    }
}
