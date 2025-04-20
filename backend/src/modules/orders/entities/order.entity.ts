import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryStatus } from '../enums/delivery-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Restaurant, { eager: true })
  @JoinColumn()
  restaurant: Restaurant;

  @ManyToOne(() => User)
  @JoinColumn()
  customer: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  deliveryPerson: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.NOT_ASSIGNED,
  })
  deliveryStatus: DeliveryStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CREDIT_CARD,
  })
  paymentMethod: PaymentMethod;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tip: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('text', { nullable: true })
  customerNotes: string;

  @Column('text', { nullable: true })
  restaurantNotes: string;

  @Column('text', { nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  delivery_address: string;

  @Column('jsonb', { nullable: true })
  delivery_coordinates: { lat: number; lng: number };

  @Column({ nullable: true })
  estimatedDeliveryTime: Date;

  // Timestamps para seguimiento del pedido
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  preparedAt: Date;

  @Column({ nullable: true })
  readyAt: Date;

  @Column({ nullable: true })
  pickedUpAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  // Métodos helper
  calculateTotal(): number {
    this.subtotal = this.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    this.total = this.subtotal + this.tax + this.deliveryFee + this.tip;
    return this.total;
  }
}