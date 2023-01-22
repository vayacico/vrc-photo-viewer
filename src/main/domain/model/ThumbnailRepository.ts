export default interface ThumbnailRepository {
  getThumbnailDirectoryPath(): Promise<string>;

  getImageThumbPath(originalImagePath: string): Promise<string>;
}
