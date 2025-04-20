import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menu_categories')
export class MenuCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
<<<<<<< HEAD
  
  // Campo virtual para facilitar la asignación (no está mapeado a una columna)
  restaurantId: string;
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f

  @OneToMany(() => MenuItem, item => item.category)
  items: MenuItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}