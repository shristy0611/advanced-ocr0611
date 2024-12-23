import { CONFIG } from './config';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateImageFile(file: File): void {
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    throw new ValidationError(`File size too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  if (!CONFIG.SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type. Supported types: ${CONFIG.SUPPORTED_MIME_TYPES.join(', ')}`
    );
  }
}