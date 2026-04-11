import { Injectable } from '@nestjs/common';
import { Conversation, ConversationStep } from 'src/database/entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Patient } from 'src/database/entities/patient.entity';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { AppointmentType } from 'src/database/entities/appointment.entity';

@Injectable()
export class ConversationHandler {
  constructor(
    private convoService: ConversationService,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    private appointmentService: AppointmentService,
  ) {}

  async handle(convo: Conversation, message: string) {
    switch (convo.step) {
      case ConversationStep.ASK_NAME:
        convo.name = message;
        convo.step = ConversationStep.ASK_AGE;
        await this.convoService.save(convo);
        return 'What is your age ?\n';

      case ConversationStep.ASK_AGE:
        convo.age = parseInt(message);
        convo.step = ConversationStep.ASK_ADDRESS;
        await this.convoService.save(convo);
        return 'What is your address ?\n';

      case ConversationStep.ASK_ADDRESS:
        convo.address = message;
        convo.step = ConversationStep.ASK_TYPE;
        await this.convoService.save(convo);
        return 'Select type:\n1. First Visit\n2. Follow-up';

      case ConversationStep.ASK_TYPE:
        convo.type = message === '1' ? 'First Visit' : 'Follow-up';
        convo.step = ConversationStep.ASK_GENDER;
        await this.convoService.save(convo);
        return 'Select gender:\n1. Male\n2. Female';

      case ConversationStep.ASK_GENDER: {
        convo.gender = message === '1' ? 'Male' : 'Female';

        const doctors = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        const list = doctors.map((d, i) => `${i + 1}. ${d.name}`).join('\n');

        convo.step = ConversationStep.ASK_DOCTOR;
        await this.convoService.save(convo);

        return `Select doctor:\n${list}`;
      }

      case ConversationStep.ASK_DOCTOR: {
        const doctorsList = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        const selected = doctorsList[parseInt(message) - 1];
        if (!selected) return 'Invalid doctor';

        convo.doctor_id = selected.id;
        convo.step = ConversationStep.ASK_DATE;
        await this.convoService.save(convo);

        return 'Select date:\n1. Today\n2. Tomorrow\n3. Day after Tomorrow';
      }

      case ConversationStep.ASK_DATE: {
        const date = this.getDate(message);
        if (!date) return 'Invalid date';

        convo.appointment_date = date;
        convo.step = ConversationStep.ASK_TIME;
        await this.convoService.save(convo);

        return 'Enter time (HH:mm)';
      }

      case ConversationStep.ASK_TIME:
        convo.appointment_time = `${convo.appointment_date}T${message}:00`;
        convo.step = ConversationStep.CONFIRM;
        await this.convoService.save(convo);

        return 'Confirm?\n1. Yes\n2. No';

      case ConversationStep.CONFIRM:
        if (message !== '1') {
          await this.convoService.delete(convo.phone);
          return 'Cancelled';
        }

        return this.book(convo);
    }
  }

  async book(convo: Conversation) {
    console.log('📥 Booking started', convo);

    let patient = await this.patientRepo.findOne({
      where: { phone: convo.phone },
    });

    if (!patient) {
      console.log('👤 Creating patient...');
      patient = await this.patientRepo.save({
        name: convo.name,
        phone: convo.phone,
        gender: convo.gender,
        age: convo.age,
        address: convo.address,
        clinic_id: 'default-clinic',
      });
      console.log('✅ Patient saved:', patient);
    }

    try {
      console.log('📅 Creating appointment...');

      console.log("Value of doctor id before saving into db ", convo.doctor_id);

      const rawPhone = convo.phone;
      const cleanedPhone = rawPhone.replace('whatsapp:', '');


      const res = await this.appointmentService.create(
        {
          patient_id: patient.id,
          doctor_id: convo.doctor_id,
          patient_name: convo.name,
          patient_phone: cleanedPhone,
          type: this.mapAppointmentType(convo.type),
          appointment_time: convo.appointment_time,
        },
        'default-clinic',
      );

      console.log('✅ Appointment result:', res);

      await this.convoService.delete(convo.phone);
      return '✅ Appointment booked!';
    } catch (err) {
      console.error('❌ Appointment error:', err);
      return '❌ Slot already booked';
    }
  }

  getDate(option: string) {
    const d = new Date();
    if (option === '1') return d.toISOString().split('T')[0];
    if (option === '2') {
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }
    if (option === '3') {
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    }
    return null;
  }

  mapAppointmentType(type: string): AppointmentType {
    switch (type) {
      case 'First Visit':
        return AppointmentType.FIRST_VISIT;
      case 'Follow-up':
        return AppointmentType.FOLLOW_UP;
      default:
        throw new Error(`Invalid appointment type: ${type}`);
    }
  }
}