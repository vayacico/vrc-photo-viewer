export default interface ApplicationService {
  close: () => Promise<string>;
  minimize: () => Promise<void>;
  sizeChange: () => Promise<string[]>;
  onDrag: (path: string) => Promise<void>;
  openUrlInBrowser: (path: string) => Promise<void>;
  openFileInDefaultApplication: (path: string) => Promise<void>;
  openLicenceFile: () => Promise<void>;
  getVersion: () => Promise<string>;
}
