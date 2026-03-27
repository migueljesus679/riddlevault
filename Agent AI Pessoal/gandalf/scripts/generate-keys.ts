import crypto from 'node:crypto';

const encryptionKey = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('=== Gandalf - Chaves Geradas ===\n');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\nCopia estas linhas para o ficheiro .env');
