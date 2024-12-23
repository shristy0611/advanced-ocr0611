import type { GenerativePart } from './types';

export class FileReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileReadError';
  }
}

export async function fileToGenerativePart(file: File): Promise<GenerativePart> {
  try {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          if (!base64Data) {
            reject(new FileReadError('Invalid file data format'));
            return;
          }
          resolve(base64Data);
        } else {
          reject(new FileReadError('Failed to read file as base64'));
        }
      };
      
      reader.onerror = () => reject(new FileReadError('Error reading file'));
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type
      }
    };
  } catch (error) {
    if (error instanceof FileReadError) {
      throw error;
    }
    throw new FileReadError('Failed to process image file');
  }
}