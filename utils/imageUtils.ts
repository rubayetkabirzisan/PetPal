/**
 * Utilities for handling images in the app
 */

import * as ImagePicker from "expo-image-picker";

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileSize?: number;
}

/**
 * Validates that a URI is properly formatted and accessible
 */
export function isValidImageUri(uri: string): boolean {
  return !!uri && (
    uri.startsWith('file://') || 
    uri.startsWith('content://') || 
    uri.startsWith('assets-library://') ||
    uri.startsWith('http://') || 
    uri.startsWith('https://')
  );
}

/**
 * Process image picker result to extract valid image URIs
 */
export function processImagePickerResult(
  result: ImagePicker.ImagePickerResult,
  currentImages: ImageInfo[] = []
): ImageInfo[] {
  if (result.canceled || !result.assets || result.assets.length === 0) {
    return currentImages;
  }

  // Filter out any invalid assets and convert to ImageInfo format
  const validImages = result.assets
    .filter(asset => isValidImageUri(asset.uri))
    .map(asset => ({
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      type: asset.mimeType,
      fileSize: asset.fileSize
    }));

  // Combine with existing images
  return [...currentImages, ...validImages];
}

/**
 * Ensures we don't exceed the maximum number of photos
 */
export function enforceMaxPhotos(photos: ImageInfo[], maxCount: number): ImageInfo[] {
  if (photos.length <= maxCount) return photos;
  
  return photos.slice(0, maxCount);
}

/**
 * Prepare images for API submission by extracting URIs
 */
export function prepareImagesForSubmission(images: ImageInfo[]): string[] {
  return images
    .filter(img => isValidImageUri(img.uri))
    .map(img => img.uri);
}

/**
 * Get a display count string for images
 */
export function getImageCountString(count: number, max: number): string {
  return `${count} of ${max} photos selected`;
}

/**
 * Check if image is already selected (by URI)
 */
export function isImageAlreadySelected(uri: string, images: ImageInfo[]): boolean {
  return images.some(img => img.uri === uri);
}

/**
 * Estimates file size in MB from bytes or returns a fallback size
 */
export function estimateFileSizeMB(bytes: number | undefined): number {
  if (typeof bytes !== 'number' || bytes <= 0) return 0.5; // Default estimate
  return bytes / (1024 * 1024);
}
