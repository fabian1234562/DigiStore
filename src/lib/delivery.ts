/**
 * DELIVERY — Sistema de entrega digital segura con tokens stateless HMAC.
 */

import { db, isDbAvailable } from '@/lib/db';
import crypto from 'crypto';

const DEFAULT_EXPIRY_HOURS = 24;
const DEFAULT_MAX_DOWNLOADS = 5;
const TOKEN_SECRET = process.env.ADMIN_SECRET_KEY || 'digistore-token-secret-change-me';

declare global {
  // eslint-disable-next-line no-var
  var deliveryDownloads: Map<string, number> | undefined;
}
if (!globalThis.deliveryDownloads) {
  globalThis.deliveryDownloads = new Map();
}
const downloadCounts = globalThis.deliveryDownloads;

function base64urlEncode(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(s: string): Buffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

interface TokenPayload {
  productId: string;
  productName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  sha256: string;
  version: string;
  userEmail: string;
  orderId?: string;
  exp: number;
  maxDownloads: number;
}

function generateStatelessToken(data: TokenPayload): string {
  const payloadStr = base64urlEncode(JSON.stringify(data));
  const signature = signPayload(payloadStr);
  return `${payloadStr}.${signature}`;
}

function verifyStatelessToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSignature = signPayload(payloadStr);

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadStr).toString('utf-8'));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface CreateDeliveryInput {
  productId: string;
  userEmail: string;
  userId?: string;
  orderId?: string;
  expiryHours?: number;
  maxDownloads?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeliveryResult {
  success: boolean;
  token: string;
  downloadUrl: string;
  expiresAt: Date;
  maxDownloads: number;
  error?: string;
}

export async function createDelivery(input: CreateDeliveryInput): Promise<DeliveryResult> {
  const expiresAt = new Date(Date.now() + (input.expiryHours ?? DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000);
  const maxDownloads = input.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  let product: any = null;

  if (isDbAvailable()) {
    try {
      product = await db!.product.findUnique({ where: { id: input.productId } });
    } catch (err) {
      console.error('[delivery] DB error:', err);
    }
  }

  if (!product) {
    const { getFallbackProductById } = await import('@/lib/fallback-catalog');
    product = await getFallbackProductById(input.productId);
  }

  if (!product) {
    return { success: false, token: '', downloadUrl: '', expiresAt: new Date(), error: 'product_not_found' };
  }

  if (!product.verified) {
    return { success: false, token: '', downloadUrl: '', expiresAt: new Date(), error: 'product_not_verified' };
  }
  if (!product.download_enabled) {
    return { success: false, token: '', downloadUrl: '', expiresAt: new Date(), error: 'download_disabled' };
  }
  if (!product.distribution_allowed) {
    return { success: false, token: '', downloadUrl: '', expiresAt: new Date(), error: 'distribution_not_allowed' };
  }

  const token = generateStatelessToken({
    productId: product.id,
    productName: product.name,
    fileName: product.file_name || '',
    fileType: product.file_type || 'application/octet-stream',
    fileSize: product.file_size || 0,
    storageKey: product.storage_key || '',
    sha256: product.sha256 || '',
    version: product.version || '1.0.0',
    userEmail: input.userEmail,
    orderId: input.orderId,
    exp: expiresAt.getTime(),
    maxDownloads,
  });

  return {
    success: true,
    token,
    downloadUrl: `${baseUrl}/download/${token}`,
    expiresAt,
    maxDownloads,
  };
}

export interface VerifyDeliveryResult {
  valid: boolean;
  error?: string;
  delivery?: {
    token: string;
    productId: string;
    productName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;
    sha256: string;
    version: string;
    userEmail: string;
    orderId?: string;
    expiresAt: Date;
    downloadsCount: number;
    maxDownloads: number;
    remaining: number;
  };
}

export async function verifyDelivery(token: string): Promise<VerifyDeliveryResult> {
  if (!token) return { valid: false, error: 'invalid_token_format' };

  if (token.includes('.')) {
    const payload = verifyStatelessToken(token);
    if (payload) {
      const downloadsCount = downloadCounts.get(token) || 0;
      if (downloadsCount >= payload.maxDownloads) {
        return { valid: false, error: 'download_limit_reached' };
      }

      return {
        valid: true,
        delivery: {
          token,
          productId: payload.productId,
          productName: payload.productName,
          fileName: payload.fileName,
          fileType: payload.fileType,
          fileSize: payload.fileSize,
          storageKey: payload.storageKey,
          sha256: payload.sha256,
          version: payload.version,
          userEmail: payload.userEmail,
          orderId: payload.orderId,
          expiresAt: new Date(payload.exp),
          downloadsCount,
          maxDownloads: payload.maxDownloads,
          remaining: payload.maxDownloads - downloadsCount,
        },
      };
    }
  }

  return { valid: false, error: 'token_not_found' };
}

export async function recordDownload(
  token: string,
  metadata: { ipAddress?: string; userAgent?: string; bytesServed?: number },
): Promise<void> {
  const current = downloadCounts.get(token) || 0;
  downloadCounts.set(token, current + 1);
}

export async function invalidateDelivery(token: string, reason: string): Promise<boolean> {
  // Stateless tokens no se pueden invalidar sin DB
  return false;
}

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || undefined;
}

export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
