import ApplicationService from '../application';

export default class ApplicationServiceImpl implements ApplicationService {
  close(): Promise<string> {
    return Promise.resolve('');
  }

  getVersion(): Promise<string> {
    return Promise.resolve('');
  }

  minimize(): Promise<void> {
    return Promise.resolve(undefined);
  }

  onDrag(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  openFileInDefaultApplication(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  openLicenceFile(): Promise<void> {
    return Promise.resolve(undefined);
  }

  openUrlInBrowser(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  sizeChange(): Promise<string[]> {
    return Promise.resolve([]);
  }
}
