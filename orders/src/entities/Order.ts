import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Dish } from './Dish';
import { OrderDish } from './OrderDish';

export enum OrderStatus {
  waiting = 'waiting',
  cooking = 'cooking',
  completed = 'completed',
  canceled = 'canceled',
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.waiting, name: 'status' })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  special_requests: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
