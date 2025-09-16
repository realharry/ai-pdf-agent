import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import JSZip from "jszip"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(data: ArrayBuffer, filename: string, mimeType: string = 'application/pdf') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadZipFile(files: { name: string; data: ArrayBuffer }[], zipFilename: string) {
  const zip = new JSZip();
  
  // Add each file to the zip
  files.forEach(file => {
    zip.file(file.name, file.data);
  });
  
  // Generate the zip file
  const zipData = await zip.generateAsync({ type: "blob" });
  
  // Download the zip file
  const url = URL.createObjectURL(zipData);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateFilename(baseName: string, operation: string, extension: string = 'pdf'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${operation}_${timestamp}.${extension}`;
}