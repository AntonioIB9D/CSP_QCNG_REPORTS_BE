import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  pk1: number;

  @Column()
  usuario: string;

  @Column()
  contrasena: string;

  @Column()
  inspector: number;
}
