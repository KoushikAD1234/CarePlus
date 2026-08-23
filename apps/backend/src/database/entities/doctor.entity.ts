import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  phone: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  registration_number: string;

  @Column({ nullable: true })
  fees: number;

  @Column({ nullable: true })
  avatar_url: string;

  @Column()
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  reset_otp!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_otp_expiry!: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ unique: true })
  booking_code: string;
}
