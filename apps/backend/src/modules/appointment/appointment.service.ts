import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entity';
import { CreateAppointmentDto } from 'src/dto/create-appointment.dto';
import { GetAppointmentsDto } from 'src/dto/get-appointment.dto';
import { UpdateStatusDto } from 'src/dto/update-status.dto';
import { Between, ILike, Repository } from 'typeorm';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async create(body: CreateAppointmentDto, doctor_id: string) {
    const appointment = this.appointmentRepo.create({
      ...body,
      // doctor_id,
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

    // DATE FILTER
    if (query.date) {
      const now = new Date();

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

    // SEARCH + DATE TOGETHER
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

    // DEFAULT
    return this.appointmentRepo.find({
      where,
      order: { appointment_time: 'ASC' },
    });
  }

  async updateStatus(id: string, body: UpdateStatusDto) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    appointment.status = body.status;

    return this.appointmentRepo.save(appointment);
  }

  async deleteAppointment(id: string) {
    const result = await this.appointmentRepo.delete(id);

    if (result.affected === 0) {
      throw new Error('Appointment Not found');
    }

    return { message: 'Deleted Successfully' };
  }
}
