import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dish } from './Dish';
import { Order } from './Order';

@Entity('order_dish')
export class OrderDish {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => Dish, { nullable: false })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  quantity: number;
}
