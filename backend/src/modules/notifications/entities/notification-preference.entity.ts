import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('app_notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  orderCreated: boolean;

  @Column({ default: true })
  orderStatusChanged: boolean;

  @Column({ default: true })
  orderAssigned: boolean;

  @Column({ default: true })
  deliveryStatusChanged: boolean;

  @Column({ default: true })
  paymentReceived: boolean;

  @Column({ default: true })
  systemAlert: boolean;

  @Column({ default: true })
  promotion: boolean;

  @Column({ default: true })
  enablePushNotifications: boolean;

  @Column({ default: true })
  enableEmailNotifications: boolean;

  @Column({ default: true })
  enableInAppNotifications: boolean;

  @Column({ nullable: true })
  pushSubscription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}