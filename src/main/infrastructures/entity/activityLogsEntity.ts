import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ActivityLogs')
export default class ActivityLogsEntity {
  @PrimaryColumn()
  id!: number;

  @Column()
  activityType!: number;

  @Column()
  timestamp!: Date;

  @Column({
    nullable: true,
  })
  userName!: string;

  @Column({
    nullable: true,
  })
  worldId!: string;

  @Column({
    nullable: true,
  })
  worldName!: string;
}
