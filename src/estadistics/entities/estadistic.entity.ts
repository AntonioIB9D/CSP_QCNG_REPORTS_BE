import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('registros')
export class Estadistic {
  @PrimaryGeneratedColumn()
  pk1: number; // ← clave primaria real

  @Column()
  folio: number; // ← ahora es solo un campo normal

  @Column()
  producto: string;

  @Column()
  defecto: string;

  @Column()
  zona: string;

  @Column()
  proceso: string;

  @Column({ type: 'date' })
  fecha_rechazo: Date | string;

  @Column({ type: 'timestamp' })
  fecha_alta: Date;

  @Column()
  cavidad: string;

  @Column()
  prensa: string;

  @Column()
  serie: string;

  @Column()
  usuario_alta: string;

  @Column()
  estatus: string;
}
