import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entity';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Patient } from 'src/database/entities/patient.entity';
import { CreateAppointmentDto } from 'src/dto/create-appointment.dto';
import { GetAppointmentsDto } from 'src/dto/get-appointment.dto';
import { UpdateStatusDto } from 'src/dto/update-status.dto';
import { Between, ILike, Repository } from 'typeorm';
import { WhatsappSender } from '../whatsapp/whatsapp.sender';
import { jsPDF } from 'jspdf';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @Inject(forwardRef(() => WhatsappSender))
    private readonly whatsappSender: WhatsappSender,
  ) {}

  async create(body: CreateAppointmentDto, doctor_id: string) {
    const appointment = this.appointmentRepo.create({
      ...body,
      clinic_id: 'default-clinic',
      appointment_time: new Date(body.appointment_time),
    });
    try {
      return await this.appointmentRepo.save(appointment);
    } catch (error) {
      console.log('Error in create appointment:', error);
      throw new BadRequestException('Slot already booked');
    }
  }

  async findAll(doctor_id: string) {
    return this.appointmentRepo.find({
      where: { doctor_id },
      order: { appointment_time: 'ASC' },
    });
  }

  async getAppointments(query: GetAppointmentsDto, doctor_id: string) {
    const where: any = { doctor_id };

    if (query.date) {
      let start: Date | undefined;
      let end: Date | undefined;

      if (query.date === 'today') {
        start = new Date();
        start.setHours(0, 0, 0, 0);

        end = new Date();
        end.setHours(23, 59, 59, 999);
      }

      if (query.date === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        start = new Date(tomorrow);
        start.setHours(0, 0, 0, 0);

        end = new Date(tomorrow);
        end.setHours(23, 59, 59, 999);
      }

      if (query.date === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        start = new Date(yesterday);
        start.setHours(0, 0, 0, 0);

        end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        where.appointment_time = Between(start, end);
      }
    }

    if (query.search) {
      return this.appointmentRepo.find({
        where: [
          {
            ...where,
            patient_name: ILike(`%${query.search}%`),
          },
          {
            ...where,
            patient_phone: ILike(`%${query.search}%`),
          },
        ],
        order: { appointment_time: 'ASC' },
      });
    }

    return this.appointmentRepo.find({
      where,
      order: { appointment_time: 'ASC' },
    });
  }

  async updateStatus(id: string, body: UpdateStatusDto) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    appointment.status = body.status;

    return this.appointmentRepo.save(appointment);
  }

  async deleteAppointment(id: string) {
    const result = await this.appointmentRepo.delete(id);

    if (result.affected === 0) {
      throw new BadRequestException('Appointment Not found');
    }

    return { message: 'Deleted Successfully' };
  }

  async sendPrescription(data: {
    appointmentId?: string;
    doctorId?: string;
    patientPhone: string;
    patientName?: string;
    patientAge?: string | number;
    patientGender?: string;
    patientAddress?: string;
    doctorName?: string;
    prescriptionText: string;
  }) {
    const {
      appointmentId,
      doctorId,
      patientPhone,
      patientName,
      patientAge,
      patientGender,
      patientAddress,
      prescriptionText,
    } = data;

    // Log the incoming request payload
    console.log('📥 Incoming sendPrescription payload:', {
      appointmentId,
      doctorId,
      patientPhone,
      patientName,
      patientAge,
      patientGender,
      patientAddress,
      prescriptionText,
    });

    if (!patientPhone || !prescriptionText) {
      throw new BadRequestException(
        'Patient phone number and prescription text are required.',
      );
    }

    // Retrieve Doctor record
    let doctor: Doctor | null = null;
    let appointment: Appointment | null = null;
    let patient: Patient | null = null;


    if (appointmentId) {
      appointment = await this.appointmentRepo.findOne({
        where: { id: appointmentId },
      });
      if (appointment?.doctor_id) {
        doctor = await this.doctorRepo.findOne({
          where: { id: appointment.doctor_id },
        });
      }
    }

    const patient_id = appointment?.patient_id;
    if (patient_id) {
      patient = await this.patientRepo.findOne({
        where: { id: patient_id },
      });
    }

    if (!doctor && doctorId) {
      doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    }

    // Doctor Details with Defaults
    const dName = doctor?.name;
    const rawQual = doctor?.qualification || 'Qualification';
    const dSpec = doctor?.specialization || 'Specialization';
    const dReg = doctor?.registration_number || 'Registration Number';
    const dAddress = doctor?.address || 'Address';
    const dPhone = doctor?.phone || 'Phone';
    const dEmail = doctor?.email || 'Email';

    // Clean qualification string
    const dQual = rawQual.trim();

    // Patient Details
    const pName = patientName || 'Patient Name';
    const pPhone =
      patientPhone || appointment?.patient_phone || 'Patient Phone';
    const pAge = patient?.age || 'Patient Age';
    const pGender = patient?.gender || 'Patient Gender';
    const pAgeGender = `${patient?.age} Yrs` || 'Patient Age';
    const pAddress = patient?.address || 'Patient Address';

    let cleanPhone = pPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    // Initialize A4 Document
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // 1. Background Fill
    doc.setFillColor(252, 253, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Top Dual Accent Bar
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 130, 4, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(130, 0, 80, 4, 'F');

    // 2. Doctor Details Header Section
    doc.setTextColor(15, 23, 42);

    // Main Heading: Doctor Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Dr. ${dName}`, 14, 16);

    // Subheading: Qualification / Degree
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);

    const wrappedQual = doc.splitTextToSize(dQual, 122);
    doc.text(wrappedQual, 14, 21.5);

    let currentY = 21.5 + wrappedQual.length * 4;

    // Specialization & Registration Number
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${dSpec} | Reg. No: ${dReg}`, 14, currentY + 1.5);

    // Clinic Name & Doctor Practice Address
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    // Wrap Doctor Address to fit cleanly
    const fullClinicLine = `${dAddress}`;
    const wrappedClinicLine = doc.splitTextToSize(fullClinicLine, 122);
    doc.text(wrappedClinicLine, 14, currentY + 5.5);

    let contactY = currentY + 5.5 + wrappedClinicLine.length * 3.5;
    doc.text(`Contact: ${dPhone} | Email: ${dEmail}`, 14, contactY);

    // 3. Top Right Branding Box
    doc.setFillColor(240, 246, 255);
    doc.roundedRect(142, 10, 54, 25, 3, 3, 'F');
    doc.setDrawColor(219, 234, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(142, 10, 54, 25, 3, 3, 'D');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('POWERED BY', 169, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('CarePlus', 169, 22, { align: 'center' });

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Provider Portal v1.0', 169, 28, { align: 'center' });

    // Separator Line
    const dividerY = Math.max(contactY + 5, 40);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, dividerY, 196, dividerY);

    // 4. Expanded Patient Info Card (5-Column Layout + Address)
    const cardY = dividerY + 4;
    const cardHeight = 28;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, cardY, 182, cardHeight, 3.5, 3.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, cardY, 182, cardHeight, 3.5, 3.5, 'D');

    // Blue Left Border Bar
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, cardY, 2.5, cardHeight, 1, 1, 'F');

    // Row 1: Columns
    // Col 1: Name (X: 20)
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT NAME', 20, cardY + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(pName, 20, cardY + 13);

    // Col 2: Phone (X: 68)
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PHONE NUMBER', 68, cardY + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(pPhone, 68, cardY + 13);

    // Col 3: Age (X: 110)
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('AGE', 110, cardY + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(pAge ? `${pAge} Yrs` : 'N/A', 110, cardY + 13);

    // Col 4: Gender (X: 135)
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GENDER', 135, cardY + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(pGender || 'N/A', 135, cardY + 13);

    // Col 5: Date (X: 160)
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION DATE', 160, cardY + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(dateStr, 160, cardY + 13);

    // Divider Line inside Card
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(20, cardY + 17, 190, cardY + 17);

    // Row 2: Patient Address
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDRESS:', 20, cardY + 23);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(pAddress, 36, cardY + 23);

    // 5. Rx Symbol Header
    const rxY = cardY + cardHeight + 6;
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, rxY, 11, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Rx', 19.5, rxY + 7, { align: 'center' });

    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.7);
    doc.line(27, rxY + 5, 196, rxY + 5);

    // 6. Medication Body Container
    const bodyY = rxY + 13;
    const bodyHeight = 175;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, bodyY, 182, bodyHeight, 4, 4, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, bodyY, 182, bodyHeight, 4, 4, 'D');

    // Prescription Text
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    const splitText = doc.splitTextToSize(prescriptionText, 172);
    let printY = bodyY + 10;

    splitText.forEach((line: string) => {
      doc.text(line, 20, printY);
      printY += 6;
    });

    // 7. Footer Bar
    const footerY = 282;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Issued electronically by Dr. ${dName} via CarePlus Provider Portal.`,
      14,
      footerY + 5,
    );
    doc.text(`Generated: ${dateStr}`, 196, footerY + 5, { align: 'right' });

    // Convert Buffer & Upload to Cloudinary
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    const mediaUrl: string = await new Promise((resolve, reject) => {
      const uploadStream = (cloudinary.uploader.upload_stream as any)(
        {
          resource_type: 'raw',
          folder: 'prescriptions',
          public_id: `prescription_${Date.now()}.pdf`,
          format: 'pdf',
          flags: 'attachment:false',
          type: 'upload',
        },
        (error: any, result: any) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    const message = `*CarePlus Prescription* 🩺\n\n*Patient Name:* ${pName}\n*Phone:* ${pPhone}\n*Doctor:* Dr. ${dName}\n*Date:* ${dateStr}\n\n*Rx Details:*\n${prescriptionText}\n\n_Download your PDF below._`;

    await this.whatsappSender.sendMessage(cleanPhone, message, mediaUrl);

    return {
      success: true,
      message: 'Prescription PDF dispatched successfully via WhatsApp',
    };
  }
}
