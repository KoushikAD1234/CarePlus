import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entity';
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
    patientPhone: string;
    patientName?: string;
    doctorName?: string;
    prescriptionText: string;
  }) {
    const { patientPhone, patientName, doctorName, prescriptionText } = data;

    if (!patientPhone || !prescriptionText) {
      throw new BadRequestException(
        'Patient phone number and prescription text are required.',
      );
    }

    let cleanPhone = patientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    // Generate jsPDF document
    const doc = new jsPDF();
    const pName = patientName || 'Patient';
    const dName = doctorName || 'Koushik Chakraborty';
    const dateStr = new Date().toLocaleDateString();

    doc.setFillColor(250, 252, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 140, 5, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(140, 0, 70, 5, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`Dr. ${dName}`, 14, 24);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('General Physician & Clinical Specialist', 14, 30);
    doc.text(`Date: ${dateStr}`, 14, 36);

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(142, 14, 54, 24, 3, 3, 'F');
    doc.setDrawColor(219, 234, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(142, 14, 54, 24, 3, 3, 'D');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('POWERED BY', 169, 20, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('CarePlus', 169, 27, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Provider Portal v1.0', 169, 33, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 43, 196, 43);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 49, 182, 26, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 49, 182, 26, 4, 4, 'D');

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 49, 3, 26, 1.5, 1.5, 'F');

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT NAME', 24, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(pName, 24, 66);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PHONE NUMBER', 88, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(patientPhone, 88, 66);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VISIT DATE', 148, 58);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(dateStr, 148, 66);

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 84, 12, 12, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Rx', 20, 91.5, { align: 'center' });

    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.8);
    doc.line(30, 90, 196, 90);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 102, 182, 160, 4, 4, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 102, 182, 160, 4, 4, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(prescriptionText, 172);
    doc.text(splitNotes, 19, 112);

    const footerY = 278;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Electronically generated prescription issued via CarePlus Provider Portal.',
      14,
      footerY + 6,
    );
    doc.text(`Issued: ${dateStr}`, 196, footerY + 6, { align: 'right' });

    // Convert PDF array buffer into a Node Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Directly upload PDF Buffer to Cloudinary
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
            return reject(
              error || new Error('Cloudinary upload failed: Empty result'),
            );
          }
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    // Format WhatsApp Caption
    const message = `*CarePlus Medical Prescription* 🩺

*Patient Name:* ${pName}
*Doctor:* Dr. ${dName}
*Date:* ${dateStr}

----------------------------------------
*Rx / Prescription Details:*
${prescriptionText}
----------------------------------------

_Thank you for consulting with CarePlus!_`;

    console.log('📄 Generated PDF MediaUrl:', mediaUrl);

    // Send WhatsApp Message with Media Attachment
    await this.whatsappSender.sendMessage(cleanPhone, message, mediaUrl);

    return {
      success: true,
      message: 'Prescription PDF dispatched successfully via WhatsApp',
    };
  }
}
