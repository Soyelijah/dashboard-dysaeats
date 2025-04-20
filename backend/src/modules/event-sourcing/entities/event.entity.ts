import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  aggregate_type: string;

  @Column()
  aggregate_id: string;

  @Column()
  type: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @Column()
  version: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;
}