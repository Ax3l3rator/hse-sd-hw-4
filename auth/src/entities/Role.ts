import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity('roles')
export class Role {
  // @PrimaryGeneratedColumn()
  // id: number;
  @PrimaryColumn({ unique: true })
  name: string;
  @Column()
  permission_level: number;
  @Column({ nullable: true })
  pass_code: string;
}
