import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('photo')
export default class PhotoEntity {
  @PrimaryColumn()
  path!: string;

  @Column()
  @Index('create_date_index')
  createDate!: Date;
}
