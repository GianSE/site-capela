#!/usr/bin/env node
/**
 * Gera o SQL para criar o primeiro administrador (hash PBKDF2 compatível com o Worker).
 *
 * Uso:
 *   node scripts/create-admin.mjs "email@exemplo.com" "Nome" "senha"
 *
 * Depois rode o SQL impresso, por exemplo:
 *   wrangler d1 execute capela-db --remote --command "<SQL>"
 */

const [, , email, name, password] = process.argv;

if (!email || !name || !password) {
  console.error('Uso: node scripts/create-admin.mjs "email" "Nome" "senha"');
  process.exit(1);
}

const enc = new TextEncoder();
const ITER = 100_000;

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return Buffer.from(bin, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
  'deriveBits',
]);
const bits = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
  key,
  256
);
const hash = `pbkdf2$${ITER}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;

const safeEmail = email.trim().toLowerCase().replace(/'/g, "''");
const safeName = name.replace(/'/g, "''");

const sql = `INSERT INTO admin_users (email, name, password_hash) VALUES ('${safeEmail}', '${safeName}', '${hash}');`;

console.log('\n--- SQL para criar o admin ---\n');
console.log(sql);
console.log('\n--- Rode (banco remoto) ---\n');
console.log(`wrangler d1 execute capela-db --remote --command "${sql.replace(/"/g, '\\"')}"`);
console.log('\n--- Ou local (dev) ---\n');
console.log(`wrangler d1 execute capela-db --local --command "${sql.replace(/"/g, '\\"')}"`);
console.log('');
