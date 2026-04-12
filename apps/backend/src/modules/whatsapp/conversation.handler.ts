import { Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationStep,
} from 'src/database/entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Patient } from 'src/database/entities/patient.entity';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { AppointmentType } from 'src/database/entities/appointment.entity';
import { WhatsappSender } from './whatsapp.sender';
import { parseEntryMessage } from 'src/common/utils/entry-parser';

@Injectable()
export class ConversationHandler {
  constructor(
    private convoService: ConversationService,
    private sender: WhatsappSender,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    private appointmentService: AppointmentService,
  ) {}

  private readonly TEMPLATES = {
    GENDER: 'HXcc8d9bf533eb0ced84848349658b2bfa',
    TYPE: 'HXb6d1741ef55eb9e87c23bca6beeb697f',
    DATE: 'HX7d85c71075861689217a12b5311e2313',
    CONFIRMATION: 'HX0872f7f1e15d83507b13558009f92cca',
    DOCTOR_LIST: 'HX2911e7d49281591c256bbdd69e2a1321',
  };

  async handle(convo: Conversation, message: string): Promise<string | null> {
    const msg = message.trim();
    const entry = parseEntryMessage(msg);

    console.log('RAW MESSAGE:', message);
    console.log('PARSED ENTRY:', entry);

    // HANDLE QR ENTRY
    if (entry.type === 'DOCTOR_DIRECT' && !convo.doctor_id) {
      const doctor = await this.doctorRepo.findOne({
        where: { id: entry.doctorId },
      });

      console.log('Value of doctor_id ', entry.doctorId);
      console.log('Value of Doctor is ', doctor);

      if (!doctor) {
        return '❌ Invalid doctor. Please try again.';
      }

      console.log('Saving doctor_id:', doctor.id);

      await this.convoService.save({
        ...convo,
        doctor_id: doctor.id,
        step: ConversationStep.ASK_NAME,
      });

      return `👨‍⚕️ Booking with Dr. ${doctor.name}\n\nPlease enter your name`;
    }

    switch (convo.step) {
      case ConversationStep.ASK_NAME:
        convo.name = msg;
        convo.step = ConversationStep.ASK_AGE;
        await this.convoService.save(convo);
        return 'What is your age?';

      case ConversationStep.ASK_AGE:
        convo.age = parseInt(msg) || 0;
        convo.step = ConversationStep.ASK_ADDRESS;
        await this.convoService.save(convo);
        return 'What is your address?';

      case ConversationStep.ASK_ADDRESS:
        convo.address = msg;
        convo.step = ConversationStep.ASK_TYPE;
        await this.convoService.save(convo);
        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.TYPE);
        return null;

      case ConversationStep.ASK_TYPE:
        convo.type =
          msg === '1' || msg.toLowerCase().includes('first')
            ? 'First Visit'
            : 'Follow-up';
        convo.step = ConversationStep.ASK_GENDER;
        await this.convoService.save(convo);
        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.GENDER);
        return null;

      case ConversationStep.ASK_GENDER: {
        convo.gender =
          msg === '1' || msg.toLowerCase() === 'male' ? 'Male' : 'Female';

        console.log('Doctor ID at ASK_GENDER:', convo.doctor_id);

        // 🔥 Skip doctor selection if already set
        if (convo.doctor_id && convo.doctor_id !== '') {
          convo.step = ConversationStep.ASK_DATE;
          await this.convoService.save(convo);

          await this.sender.sendTemplate(convo.phone, this.TEMPLATES.DATE);
          return null;
        }

        const doctors = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        if (doctors.length === 0) {
          return "I'm sorry, there are no doctors available at this clinic right now.";
        }

        convo.step = ConversationStep.ASK_DOCTOR;
        await this.convoService.save(convo);

        await this.sender.sendDoctorList(
          convo.phone,
          this.TEMPLATES.DOCTOR_LIST,
          doctors,
        );

        return null;
      }

      case ConversationStep.ASK_DOCTOR: {
        const doctorsList = await this.doctorRepo.find({
          where: { clinic_id: 'default-clinic' },
        });

        const incomingMsg = msg.trim(); // This is the ID "37c7a979..."

        // Check if the message matches a Doctor's ID OR their Name
        const selected = doctorsList.find((d) => {
          return (
            d.id === incomingMsg ||
            d.name.toLowerCase() === incomingMsg.toLowerCase()
          );
        });

        if (!selected) {
          console.log(`❌ No match found for: "${incomingMsg}"`);
          // Send list again if no match
          await this.sender.sendDoctorList(
            convo.phone,
            this.TEMPLATES.DOCTOR_LIST,
            doctorsList,
          );
          return null;
        }

        // ✅ Success!
        console.log(`✅ Selected Doctor: ${selected.name}`);
        convo.doctor_id = selected.id;
        convo.step = ConversationStep.ASK_DATE;
        await this.convoService.save(convo);

        // Send the Date template
        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.DATE);
        return null;
      }

      case ConversationStep.ASK_DATE: {
        const date = this.getDate(msg);
        if (!date) return 'Please tap one of the date buttons below.';
        convo.appointment_date = date;
        convo.step = ConversationStep.ASK_TIME;
        await this.convoService.save(convo);
        return 'Enter time in 24 hrs format (e.g., 10:30 or 22:20)';
      }

      case ConversationStep.ASK_TIME:
        convo.appointment_time = `${convo.appointment_date}T${msg}:00`;
        convo.step = ConversationStep.CONFIRM;
        await this.convoService.save(convo);
        await this.sender.sendTemplate(
          convo.phone,
          this.TEMPLATES.CONFIRMATION,
        );
        return null;

      case ConversationStep.CONFIRM:
        // Checking for "No" or digit "2"
        if (msg === '2' || msg.toLowerCase().includes('no')) {
          await this.convoService.delete(convo.phone);
          return 'Booking cancelled. Type "Hi" to start again.';
        }
        return this.book(convo);

      default:
        return 'Type "Hi" to start a new clinic appointment booking.';
    }
  }

  async book(convo: Conversation): Promise<string> {
    try {
      let patient = await this.patientRepo.findOne({
        where: { phone: convo.phone },
      });
      if (!patient) {
        patient = await this.patientRepo.save({
          name: convo.name,
          phone: convo.phone,
          gender: convo.gender,
          age: convo.age,
          address: convo.address,
          clinic_id: 'default-clinic',
        });
      }
      await this.appointmentService.create(
        {
          patient_id: patient.id,
          doctor_id: convo.doctor_id,
          patient_name: convo.name,
          patient_phone: convo.phone.replace('whatsapp:', ''),
          type:
            convo.type === 'First Visit'
              ? AppointmentType.FIRST_VISIT
              : AppointmentType.FOLLOW_UP,
          appointment_time: convo.appointment_time,
        },
        'default-clinic',
      );

      await this.convoService.delete(convo.phone);
      return '✅ Appointment successfully booked! We look forward to seeing you.';
    } catch (err) {
      console.error(err);
      return '❌ That time slot is no longer available. Please try a different time.';
    }
  }

  private getDate(option: string) {
    const d = new Date();
    const opt = option.toLowerCase();
    if (opt.includes('1') || opt.includes('today'))
      return d.toISOString().split('T')[0];
    if (opt.includes('2') || opt.includes('tomorrow')) {
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }
    if (opt.includes('3') || opt.includes('day after')) {
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    }
    return null;
  }
}
