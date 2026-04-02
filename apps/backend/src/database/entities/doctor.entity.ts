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

  @Column({ type: 'text', nullable: true })
  reset_token!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expiry!: Date | null;
}
