import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinic_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  reset_otp!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_otp_expiry!: Date | null;
}
