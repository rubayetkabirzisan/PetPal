declare module 'expo-sharing' {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(url: string, options?: {
    mimeType?: string;
    UTI?: string;
    dialogTitle?: string;
  }): Promise<void>;
}
