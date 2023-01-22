export default interface ThumbnailService {
  openThumbnailDirectory: () => Promise<void>;
  getThumbnail: (originalFilePath: string) => Promise<string>;
}
