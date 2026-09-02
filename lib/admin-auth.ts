import 'server-only';

import { cookies } from 'next/headers';
import { requireEnv } from './config';

const COOKIE_NAME = 'acessoplus_admin';
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();
type AdminAccount = { email: string; password: string };

function toBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(requireEnv('ADMIN_SESSION_SECRET')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

function constantTimeEqual(left: string, right: string) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a[index] ^ b[index];
  return mismatch === 0;
}

function getAdminAccounts(): AdminAccount[] {
  const configured = process.env.ADMIN_ACCOUNTS?.trim();
  if (configured) {
    const parsed = JSON.parse(configured) as unknown;
    if (!Array.isArray(parsed)) throw new Error('Configuração inválida: ADMIN_ACCOUNTS');
    const accounts = parsed.map((account) => {
      if (!account || typeof account !== 'object') throw new Error('Configuração inválida: ADMIN_ACCOUNTS');
      const candidate = account as { email?: unknown; password?: unknown };
      const email = typeof candidate.email === 'string' ? candidate.email.trim().toLowerCase() : '';
      const password = typeof candidate.password === 'string' ? candidate.password : '';
      if (!email || !password) throw new Error('Configuração inválida: ADMIN_ACCOUNTS');
      return { email, password };
    });
    if (!accounts.length || new Set(accounts.map((account) => account.email)).size !== accounts.length) {
      throw new Error('Configuração inválida: ADMIN_ACCOUNTS');
    }
    return accounts;
  }
  return [{
    email: requireEnv('ADMIN_EMAIL').toLowerCase(),
    password: requireEnv('ADMIN_PASSWORD'),
  }];
}

export async function credentialsAreValid(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let authenticatedEmail = '';
  for (const account of getAdminAccounts()) {
    if (constantTimeEqual(normalizedEmail, account.email) && constantTimeEqual(password, account.password)) {
      authenticatedEmail = account.email;
    }
  }
  return authenticatedEmail || null;
}

export async function createAdminSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!getAdminAccounts().some((account) => constantTimeEqual(account.email, normalizedEmail))) {
    throw new Error('Conta administrativa não autorizada.');
  }
  const payload = toBase64Url(JSON.stringify({
    email: normalizedEmail,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  }));
  const signature = await sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
    priority: 'high',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function getAdminSession() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !constantTimeEqual(signature, await sign(payload))) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!getAdminAccounts().some((account) => constantTimeEqual(data.email!, account.email))) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}
