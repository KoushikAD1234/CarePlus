import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ConversationStep {
  START = 'START',
  WELCOME = 'WELCOME',
  WELCOME_BACK = 'WELCOME_BACK',
  ASK_NAME = 'ASK_NAME',
  ASK_AGE = 'ASK_AGE',
  ASK_ADDRESS = 'ASK_ADDRESS',
  ASK_TYPE = 'ASK_TYPE',
  ASK_GENDER = 'ASK_GENDER',
  ASK_DOCTOR = 'ASK_DOCTOR',
  ASK_DATE = 'ASK_DATE',
  ASK_TIME = 'ASK_TIME',
  CONFIRM = 'CONFIRM',
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: ConversationStep,
    default: ConversationStep.START,
  })
  step: ConversationStep;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  doctor_id: string;

  @Column({ nullable: true })
  appointment_time: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  appointment_date: string;

  @Column({ nullable: true })
  patient_id: string;
}
