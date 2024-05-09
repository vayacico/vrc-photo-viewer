export interface ScanResultResponse {
  status: 'success' | 'isScanning';
  oldPhotoCount: number;
  photoCount: number;
}
