import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  session_token: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6) + INTERVAL "15 MIN"',
    name: 'expires_at',
  })
  expires_at: Date;
}
