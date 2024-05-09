/* eslint-disable no-await-in-loop */
import { Between, DataSource } from 'typeorm';
import path from 'path';
import electron from 'electron';
import InternalDatabaseRepository from '../../domain/model/InternalDatabaseRepository';
import { Photo } from '../../domain/model/dto/photo';
import PhotoEntity from '../entity/photoEntity';

export default class InternalDatabaseRepositoryImpl
  implements InternalDatabaseRepository
{
  dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: 'sqlite',
      database: path.join(electron.app.getPath('userData'), './photo.db'),
      entities: [PhotoEntity],
      synchronize: true,
    });
  }

  private async init(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      await this.dataSource.query('PRAGMA journal_mode = OFF');
      await this.dataSource.query('PRAGMA synchronous  =  NORMAL');
    }
  }

  async getAllPhoto(): Promise<Photo[]> {
    await this.init();

    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    const result = await this.dataSource.getRepository(PhotoEntity).find({
      order: {
        createDate: 'DESC',
      },
    });

    return result.map((item) => {
      return {
        originalFilePath: item.path,
        createdDate: item.createDate,
      } as Photo;
    });
  }

  async getPhoto(from: Date, to: Date): Promise<Photo[]> {
    await this.init();
    const result = await this.dataSource.getRepository(PhotoEntity).find({
      where: {
        createDate: Between(from, to),
      },
      order: {
        createDate: 'DESC',
      },
    });

    return result.map((item) => {
      return {
        originalFilePath: item.path,
        createdDate: item.createDate,
      } as Photo;
    });
  }

  async getPhotoTimestamps(from: Date, to: Date): Promise<Date[]> {
    await this.init();
    const result = await this.dataSource.getRepository(PhotoEntity).find({
      select: ['createDate'],
      where: {
        createDate: Between(from, to),
      },
    });

    return result.map((item) => item.createDate);
  }

  async getPhotoCount(): Promise<number> {
    await this.init();

    return this.dataSource.getRepository(PhotoEntity).count();
  }

  async insertPhotos(entities: PhotoEntity[]): Promise<void> {
    await this.init();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    for (let i = 0; i < entities.length; i += 1) {
      await this.dataSource.getRepository(PhotoEntity).save(entities[i]);
      if (i % 32766 === 0) {
        await queryRunner.commitTransaction();
        await queryRunner.startTransaction();
      }
    }
    await queryRunner.commitTransaction();
  }

  async deletePhotos(paths: string[]): Promise<void> {
    await this.init();
    if (paths.length === 0) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    for (let i = 0; i < paths.length; i += 1) {
      await this.dataSource.getRepository(PhotoEntity).delete(paths[i]);
      if (i % 32766 === 0) {
        await queryRunner.commitTransaction();
        await queryRunner.startTransaction();
      }
    }
    await queryRunner.commitTransaction();
  }

  async deleteAll(): Promise<void> {
    await this.init();
    await this.dataSource.createQueryRunner().manager.clear(PhotoEntity);
  }
}
