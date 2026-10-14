// Utilities to generate realistic AWS simulation identifiers and hashes

export function generateSimulatedKmsKey(): string {
  const hex = '0123456789abcdef';
  const rand = (len: number) => Array.from({ length: len }, () => hex[Math.floor(Math.random() * hex.length)]).join('');
  return `arn:aws:kms:ap-south-1:982341982734:key/${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
}

export function generateSimulatedVersionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateSimulatedSha256(seed: string = ''): string {
  // Generate deterministic or pseudo-random 64-character hex string
  const hex = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    const charCode = (seed.charCodeAt(i % (seed.length || 1)) + i * 17) % hex.length;
    hash += hex[charCode];
  }
  return hash;
}

export function generateDemoShareToken(): string {
  // Form: sec-share-xxxxxxxxxxxx
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const rand = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `sec-${rand}`;
}

export const MOCK_KMS_KEY_ALIAS = 'alias/secureshare-customer-master-key';
export const MOCK_S3_BUCKET = 'secureshare-private-vault-ap-south-1';
export const MOCK_AWS_REGION = 'ap-south-1';
export const MOCK_KMS_ARN = 'arn:aws:kms:ap-south-1:982341982734:key/c489b910-4bf7-4c77-932d-2fe498e9a2b8';
