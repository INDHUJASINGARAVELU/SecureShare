export type FileCategory = 'private' | 'shared';

export interface MockFile {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type
  extension: string;
  category: FileCategory;
  uploadedAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  encryption: 'AWS_KMS_SSE';
  kmsKeyArn: string;
  versionId: string;
  sha256Checksum: string;
  isSimulated: boolean;
  textContent?: string; // for local text preview
  previewUrl?: string; // for images/data urls
  tags?: string[];
}
