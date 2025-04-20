import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('snapshots')
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  aggregate_type: string;

  @Column()
  aggregate_id: string;

  @Column('jsonb')
  state: Record<string, any>;

  @Column()
  version: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}