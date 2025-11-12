import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('registros')
export class Estadistic {
  @PrimaryGeneratedColumn()
  folio: number;

  @Column()
  producto: string;

  @Column()
  defecto: string;

  @Column()
  zona: string;

  @Column()
  proceso: string;

  @Column({ type: 'date' })
  fecha_rechazo: Date;

  @Column()
  fecha_alta: string;

  @Column()
  turno: number;
}
