import 'server-only';

import { cookies } from 'next/headers';
import { requireEnv } from './config';

const COOKIE_NAME = 'acessoplus_admin';
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

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

export async function credentialsAreValid(email: string, password: string) {
  const expectedEmail = requireEnv('ADMIN_EMAIL').toLowerCase();
  const expectedPassword = requireEnv('ADMIN_PASSWORD');
  return constantTimeEqual(email.trim().toLowerCase(), expectedEmail)
    && constantTimeEqual(password, expectedPassword);
}

export async function createAdminSession() {
  const payload = toBase64Url(JSON.stringify({
    email: requireEnv('ADMIN_EMAIL').toLowerCase(),
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
    if (!constantTimeEqual(data.email, requireEnv('ADMIN_EMAIL').toLowerCase())) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

