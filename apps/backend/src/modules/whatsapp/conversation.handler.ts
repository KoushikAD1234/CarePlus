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

@Injectable()
export class ConversationHandler {
  constructor(
    private readonly convoService: ConversationService,

    private readonly sender: WhatsappSender,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    private readonly appointmentService: AppointmentService,
  ) {}

  private readonly TEMPLATES = {
    // Welcome + Book Appointment button
    BOOKING_MENU: process.env.WHATSAPP_BOOKING_MENU_SID!,

    WELCOME_BACK: process.env.WHATSAPP_EXISTING_PATIENT_SID!,

    // Existing templates
    GENDER: 'HXcc8d9bf533eb0ced84848349658b2bfa',

    TYPE: 'HXb6d1741ef55eb9e87c23bca6beeb697f',

    DATE: 'HX7d85c71075861689217a12b5311e2313',

    CONFIRMATION: 'HX0872f7f1e15d83507b13558009f92cca',
  };

  async handle(convo: Conversation, message: string): Promise<string | null> {
    const msg = message.trim();

    /*
     * ============================================================
     * 1. GLOBAL CANCEL / RESET
     * ============================================================
     */

    if (msg.toLowerCase() === 'cancel' || msg.toLowerCase() === 'reset') {
      await this.convoService.delete(convo.phone);

      return (
        '🔄 Session cleared.\n\n' +
        "To start a new booking, please use your doctor's WhatsApp link or QR code."
      );
    }

    /*
     * ============================================================
     * 2. BOOK <BOOKING_CODE>
     *
     * Example:
     *
     * BOOK bdbb433b
     * ============================================================
     */

    const parts = msg.split(/\s+/);

    if (parts.length === 2 && parts[0].toUpperCase() === 'BOOK') {
      const bookingCode = parts[1];

      /*
       * Find doctor using booking code
       */

      const doctor = await this.doctorRepo.findOne({
        where: {
          booking_code: bookingCode,
        },
      });

      if (!doctor) {
        return (
          '❌ Invalid booking link.\n\n' +
          'Please use the WhatsApp link provided by your doctor.'
        );
      }

      /*
       * Associate conversation with doctor
       */

      convo.doctor_id = doctor.id;

      /*
       * Check if patient already exists
       * using WhatsApp number.
       */

      const patient = await this.patientRepo.findOne({
        where: {
          phone: convo.phone,
        },
      });

      /*
       * Clear appointment-specific data.
       *
       * First Visit / Follow-up, date and time
       * belong to the current appointment.
       */

      convo.type = '';
      convo.appointment_date = '';
      convo.appointment_time = '';

      /*
       * ==========================================================
       * EXISTING PATIENT
       * ==========================================================
       */

      if (patient) {
        convo.name = patient.name;
        convo.age = patient.age;
        convo.gender = patient.gender;
        convo.address = patient.address;

        convo.patient_id = patient.id;

        convo.step = ConversationStep.WELCOME_BACK;

        await this.convoService.save(convo);

        await this.sender.sendContent(
          convo.phone,
          this.TEMPLATES.WELCOME_BACK,
          {
            '1': doctor.name,
            '2': patient.name,
          },
        );

        return null;
      }

      /*
       * ==========================================================
       * NEW PATIENT
       * ==========================================================
       */

      convo.name = '';
      convo.age = 0;
      convo.gender = '';
      convo.address = '';

      /*
       * Start collecting patient information.
       */

      convo.step = ConversationStep.WELCOME;

      await this.convoService.save(convo);

      /*
       * Send welcome template.
       *
       * {{1}} = Doctor name
       */

      await this.sender.sendContent(convo.phone, this.TEMPLATES.BOOKING_MENU, {
        '1': doctor.name,
      });

      return null;
    }

    /*
     * ============================================================
     * 3. NO DOCTOR ASSOCIATED
     * ============================================================
     */

    if (!convo.doctor_id) {
      return (
        '👋 Welcome to CarePlus!\n\n' +
        'To book an appointment, please use the WhatsApp link or QR code provided by your doctor.'
      );
    }

    /*
     * ============================================================
     * 4. MAIN CONVERSATION FLOW
     * ============================================================
     */

    switch (convo.step) {
      /*
       * ----------------------------------------------------------
       * WELCOME
       * ----------------------------------------------------------
       *
       * ButtonPayload expected:
       *
       * BOOK_APPOINTMENT
       * CANCEL_BOOKING
       */

      case ConversationStep.WELCOME: {
        if (msg === 'BOOK_APPOINTMENT') {
          convo.step = ConversationStep.ASK_NAME;

          await this.convoService.save(convo);

          return (
            "Great! 😊 Let's get started.\n\n" +
            'Please enter your *Full Name*:'
          );
        }

        if (msg === 'CANCEL_BOOKING') {
          await this.convoService.delete(convo.phone);

          return '❌ Booking cancelled. You can start again anytime.';
        }

        /*
         * Fallback for manually typed messages.
         */

        if (msg.toLowerCase().includes('book') || msg === '1') {
          convo.step = ConversationStep.ASK_NAME;

          await this.convoService.save(convo);

          return (
            "Great! 😊 Let's get started.\n\n" +
            'Please enter your *Full Name*:'
          );
        }

        return 'Please select an option from the buttons above.';
      }

      case ConversationStep.WELCOME_BACK: {
        console.log('WELCOME_BACK received:', msg);

        /*
         * Existing patient wants to book
         */
        if (
          msg === 'BOOK_EXISTING_APPOINTMENT' ||
          msg.toLowerCase() === 'book appointment'
        ) {
          /*
           * Existing patient already has:
           *
           * name
           * age
           * gender
           * address
           *
           * So skip all profile questions.
           *
           * Go directly to appointment type.
           */

          convo.step = ConversationStep.ASK_TYPE;

          await this.convoService.save(convo);

          await this.sender.sendTemplate(convo.phone, this.TEMPLATES.TYPE);

          return null;
        }

        /*
         * Existing patient wants to update profile
         */
        if (
          msg === 'UPDATE_PATIENT_DETAILS' ||
          msg.toLowerCase() === 'update details'
        ) {
          convo.step = ConversationStep.ASK_NAME;

          await this.convoService.save(convo);

          return (
            "Sure! Let's update your profile.\n\n" +
            'Please enter your *Full Name*:'
          );
        }

        /*
         * Cancel
         */
        if (msg === 'CANCEL_BOOKING' || msg.toLowerCase() === 'cancel') {
          await this.convoService.delete(convo.phone);

          return '❌ Booking cancelled. You can start again anytime.';
        }

        return 'Please select *Book Appointment* or *Update Details*.';
      }

      /*
       * ----------------------------------------------------------
       * NAME
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_NAME: {
        if (msg.length < 2) {
          return '⚠️ Please enter a valid name ' + '(at least 2 characters).';
        }

        convo.name = msg;

        convo.step = ConversationStep.ASK_AGE;

        await this.convoService.save(convo);

        return 'What is your age?';
      }

      /*
       * ----------------------------------------------------------
       * AGE
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_AGE: {
        const age = parseInt(msg, 10);

        if (Number.isNaN(age) || age < 0 || age > 120) {
          return '⚠️ Please enter a valid age.';
        }

        convo.age = age;

        convo.step = ConversationStep.ASK_ADDRESS;

        await this.convoService.save(convo);

        return 'Please enter your address.';
      }

      /*
       * ----------------------------------------------------------
       * ADDRESS
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_ADDRESS: {
        if (msg.length < 5) {
          return '⚠️ Please provide a more detailed address.';
        }

        convo.address = msg;

        convo.step = ConversationStep.ASK_TYPE;

        await this.convoService.save(convo);

        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.TYPE);

        return null;
      }

      /*
       * ----------------------------------------------------------
       * APPOINTMENT TYPE
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_TYPE: {
        /*
         * 1 = First Visit
         * 2 = Follow-up
         */

        if (
          msg !== '1' &&
          msg !== '2' &&
          !msg.toLowerCase().includes('first') &&
          !msg.toLowerCase().includes('follow')
        ) {
          return '⚠️ Please select First Visit or Follow-up.';
        }

        convo.type =
          msg === '1' || msg.toLowerCase().includes('first')
            ? 'First Visit'
            : 'Follow-up';

        convo.step = ConversationStep.ASK_GENDER;

        await this.convoService.save(convo);

        /*
         * For existing patients we already have gender,
         * but we can still keep the current flow consistent.
         *
         * If you want to skip gender for existing patients,
         * we can optimize that separately.
         */

        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.GENDER);

        return null;
      }

      /*
       * ----------------------------------------------------------
       * GENDER
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_GENDER: {
        if (
          msg !== '1' &&
          msg !== '2' &&
          msg.toLowerCase() !== 'male' &&
          msg.toLowerCase() !== 'female'
        ) {
          return '⚠️ Please select a valid gender option.';
        }

        convo.gender =
          msg === '1' || msg.toLowerCase() === 'male' ? 'Male' : 'Female';

        convo.step = ConversationStep.ASK_DATE;

        await this.convoService.save(convo);

        /*
         * Send interactive date template.
         *
         * Expected button payloads:
         *
         * DATE_TODAY
         * DATE_TOMORROW
         * DATE_DAY_AFTER
         */

        await this.sender.sendTemplate(convo.phone, this.TEMPLATES.DATE);

        return null;
      }

      /*
       * ----------------------------------------------------------
       * DATE
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_DATE: {
        const date = this.getDate(msg);

        if (!date) {
          return (
            '⚠️ Invalid selection.\n\n' +
            'Please tap one of the date options above.'
          );
        }

        convo.appointment_date = date;

        /*
         * For now, time is entered manually.
         */

        convo.step = ConversationStep.ASK_TIME;

        await this.convoService.save(convo);

        return (
          '📅 Date selected successfully.\n\n' +
          'Enter appointment time in 24-hour format.\n\n' +
          'Example: *10:30* or *15:00*'
        );
      }

      /*
       * ----------------------------------------------------------
       * TIME
       * ----------------------------------------------------------
       */

      case ConversationStep.ASK_TIME: {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(msg)) {
          return (
            '⚠️ Invalid time format.\n\n' +
            'Please use HH:MM format.\n\n' +
            'Example: *10:30* or *15:00*'
          );
        }

        /*
         * Check for past time if appointment is today.
         */

        const todayStr = new Date().toISOString().split('T')[0];

        if (convo.appointment_date === todayStr) {
          const [hrs, mins] = msg.split(':').map(Number);

          const now = new Date();

          if (
            hrs < now.getHours() ||
            (hrs === now.getHours() && mins < now.getMinutes())
          ) {
            return (
              '⚠️ That time has already passed today.\n\n' +
              'Please choose a future time.'
            );
          }
        }

        convo.appointment_time = `${convo.appointment_date}T${msg}:00`;

        convo.step = ConversationStep.CONFIRM;

        await this.convoService.save(convo);

        await this.sender.sendTemplate(
          convo.phone,
          this.TEMPLATES.CONFIRMATION,
        );

        return null;
      }

      /*
       * ----------------------------------------------------------
       * CONFIRMATION
       * ----------------------------------------------------------
       *
       * Confirm:
       * 1
       * YES
       * CONFIRM
       * CONFIRM_BOOKING
       *
       * Change:
       * 2
       * NO
       * CHANGE
       * CHANGE_BOOKING
       */

      case ConversationStep.CONFIRM: {
        /*
         * CONFIRM
         */

        if (
          msg === '1' ||
          msg.toLowerCase() === 'yes' ||
          msg.toLowerCase() === 'confirm' ||
          msg === 'CONFIRM_BOOKING'
        ) {
          return this.book(convo);
        }

        /*
         * CHANGE
         */

        if (
          msg === '2' ||
          msg.toLowerCase() === 'no' ||
          msg.toLowerCase() === 'change' ||
          msg === 'CHANGE_BOOKING'
        ) {
          convo.step = ConversationStep.ASK_DATE;

          await this.convoService.save(convo);

          await this.sender.sendTemplate(convo.phone, this.TEMPLATES.DATE);

          return null;
        }

        return '⚠️ Please select *Confirm* or *Change*.';
      }

      /*
       * ----------------------------------------------------------
       * DEFAULT
       * ----------------------------------------------------------
       */

      default:
        return (
          "I didn't understand that.\n\n" +
          'Please follow the options provided above or type *Cancel* to restart.'
        );
    }
  }

  /*
   * ============================================================
   * CREATE APPOINTMENT
   * ============================================================
   */

  async book(convo: Conversation): Promise<string> {
    try {
      /*
       * Find existing patient using WhatsApp number.
       */

      let patient = await this.patientRepo.findOne({
        where: {
          phone: convo.phone,
        },
      });

      /*
       * Create patient if not found.
       */

      if (!patient) {
        patient = await this.patientRepo.save({
          name: convo.name,
          phone: convo.phone,
          gender: convo.gender,
          age: convo.age,
          address: convo.address,

          // Keep default clinic for now
          clinic_id: 'default-clinic',
        });
      }

      /*
       * Create appointment.
       */

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

        // Keep default clinic for now
        'default-clinic',
      );

      /*
       * Booking completed.
       */

      await this.convoService.delete(convo.phone);

      return (
        '✅ *Appointment successfully booked!*\n\n' +
        'We look forward to seeing you. 😊'
      );
    } catch (err) {
      console.error('❌ WhatsApp appointment booking failed:', err);

      return (
        '❌ Sorry, this time slot may have just been taken.\n\n' +
        'Please type *Cancel* and start again to choose another time.'
      );
    }
  }

  /*
   * ============================================================
   * DATE HELPER
   * ============================================================
   */

  private getDate(option: string): string | null {
    const d = new Date();

    const opt = option.toLowerCase().trim();

    /*
     * Today
     */

    if (opt === 'date_today' || opt === '1' || opt.includes('today')) {
      return d.toISOString().split('T')[0];
    }

    /*
     * Tomorrow
     */

    if (opt === 'date_tomorrow' || opt === '2' || opt.includes('tomorrow')) {
      d.setDate(d.getDate() + 1);

      return d.toISOString().split('T')[0];
    }

    /*
     * Day after tomorrow
     */

    if (opt === 'date_day_after' || opt === '3' || opt.includes('day after')) {
      d.setDate(d.getDate() + 2);

      return d.toISOString().split('T')[0];
    }

    return null;
  }
}
