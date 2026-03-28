import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Conversation,
  ConversationStep,
} from 'src/database/entities/conversation.entity';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { Patient } from 'src/database/entities/patient.entity';
import { Doctor } from 'src/database/entities/doctor.entity';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectRepository(Conversation)
    private convoRepo: Repository<Conversation>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    private appointmentService: AppointmentService,
  ) {}

  async handleIncoming(body: any) {
    const { from, message } = body;

    let convo = await this.convoRepo.findOne({
      where: { phone: from },
    });

    // New user
    if (!convo) {
      convo = this.convoRepo.create({
        phone: from,
        step: ConversationStep.ASK_NAME,
      });

      await this.convoRepo.save(convo);

      return "Hi! What's your name?";
    }

    function getDateFromOption(option: string): string | null {
      const today = new Date();

      let selectedDate: Date;

      switch (option) {
        case '1':
          selectedDate = today;
          break;
        case '2':
          selectedDate = new Date(today.setDate(today.getDate() + 1));
          break;
        case '3':
          selectedDate = new Date(today.setDate(today.getDate() + 2));
          break;
        default:
          return null;
      }

      return selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Existing conversation
    switch (convo.step) {
      case ConversationStep.ASK_NAME:
        convo.name = message;
        convo.step = ConversationStep.ASK_AGE;
        await this.convoRepo.save(convo);
        return 'What is your age ?';

      case ConversationStep.ASK_AGE:
        convo.age = message;
        convo.step = ConversationStep.ASK_GENDER;
        await this.convoRepo.save(convo);
        return 'Select your Gender: 1. Male 2. Female ';

      case ConversationStep.ASK_GENDER: {
        convo.gender = message === '1' ? 'Male' : 'Female';
        const doctors = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        if (!doctors.length) {
          return '❌ No doctors available.';
        }

        const doctorList = doctors
          .map((doc, index) => `${index + 1}. ${doc.name}`)
          .join('\n');

        convo.step = ConversationStep.ASK_DOCTOR;
        await this.convoRepo.save(convo);

        return `Select doctor:\n${doctorList}`;
      }

      case ConversationStep.ASK_DOCTOR: {
        const doctors = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        const index = parseInt(message) - 1;
        const selectedDoctor = doctors[index];

        if (!selectedDoctor) {
          return '❌ Invalid selection. Please choose a valid doctor.';
        }

        convo.doctor_id = selectedDoctor.id;
        convo.step = ConversationStep.ASK_DATE;

        await this.convoRepo.save(convo);

        return 'Select date:\n1. Today\n2. Tomorrow\n3. Day after tomorrow';
      }

      case ConversationStep.ASK_DATE: {
        const date = getDateFromOption(message);

        if (!date) {
          return '❌ Invalid choice. Please select 1, 2 or 3.';
        }

        convo.appointment_date = date;
        convo.step = ConversationStep.ASK_TIME;

        await this.convoRepo.save(convo);

        return 'Enter time (HH:mm in 24-hour format)';
      }

      case ConversationStep.ASK_TIME: {
        if (!/^\d{2}:\d{2}$/.test(message)) {
          return '❌ Invalid format. Use HH:mm (24-hour)';
        }

        const datetime = `${convo.appointment_date}T${message}:00Z`;

        convo.appointment_time = datetime;
        convo.step = ConversationStep.CONFIRM;

        await this.convoRepo.save(convo);

        return `Confirm booking on ${convo.appointment_date} at ${message}? (yes/no)`;
      }

      case ConversationStep.CONFIRM:
        if (message.toLowerCase() === 'yes') {
          try {
            console.log('BOOKING DATA:', {
              name: convo.name,
              gender: convo.gender,
              phone: convo.phone,
              age: convo.age,
              doctor: convo.doctor_id,
              time: convo.appointment_time,
            });
            // Find existing patient
            let patient = await this.patientRepo.findOne({
              where: {
                phone: convo.phone,
                clinic_id: 'default-clinic',
              },
            });

            // Create if not exists
            if (!patient) {
              console.log('Inside Not patient block');
              patient = this.patientRepo.create({
                name: convo.name,
                gender: convo.gender,
                phone: convo.phone,
                age: convo.age,
                clinic_id: 'default-clinic',
              });

              patient = await this.patientRepo.save(patient);
            }

            //  appointment
            await this.appointmentService.create(
              {
                patient_id: patient.id,
                doctor_id: convo.doctor_id,
                appointment_time: convo.appointment_time,
              },
              'default-clinic',
            );

            await this.convoRepo.delete({ phone: from });

            return '✅ Appointment booked successfully!';
          } catch (error) {
            convo.step = ConversationStep.ASK_TIME;
            // await this.convoRepo.save(convo);
            return '❌ Slot already booked. Please try another time.';
          }
        } else {
          await this.convoRepo.delete({ phone: from });
          return 'Booking cancelled.';
        }

      default:
        return 'Something went wrong';
    }
  }
}
