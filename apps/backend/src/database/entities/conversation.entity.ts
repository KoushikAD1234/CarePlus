import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ConversationStep {
  START = 'START',
  ASK_NAME = 'ASK_NAME',
  ASK_DOCTOR = 'ASK_DOCTOR',
  ASK_TIME = 'ASK_TIME',
  CONFIRM = 'CONFIRM',
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: ConversationStep,
    default: ConversationStep.START,
  })
  step: ConversationStep;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  doctor_id: string;

  @Column({ nullable: true })
  appointment_time: string;
}
