import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  rut: string; // RUT chileno

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RESTAURANT_ADMIN,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToOne(() => Restaurant, restaurant => restaurant.admin, { nullable: true })
  restaurant: Restaurant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método auxiliar para obtener el nombre completo
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}