import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Barbero } from '../../barberos/entities/barbero.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

export enum EstadoCita {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  DEBITO = 'debito',
  TRANSFERENCIA = 'transferencia',
}

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Barbero)
  @JoinColumn({ name: 'barbero_id' })
  barbero: Barbero;

  @Column()
  barbero_id: string;

  @ManyToOne(() => Servicio)
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @Column()
  servicio_id: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  cliente_id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
  estado: EstadoCita;

  @Column({ type: 'enum', enum: MetodoPago, nullable: true })
  metodo_pago: MetodoPago;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ nullable: true })
  cancelacion_token: string;

  @CreateDateColumn()
  created_at: Date;
}
