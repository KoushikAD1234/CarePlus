import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { UpdateDoctorProfileDto } from 'src/dto/update-doctor-profile.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // Stream buffer directly to Cloudinary
  async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'careplus/doctor_avatars' },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(
              new Error('Cloudinary upload failed: No result returned'),
            );

          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async getProfile(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    return doctor;
  }

  async updateProfile(
    id: string,
    body: any,
    file?: Express.Multer.File,
  ): Promise<Doctor> {
    let avatar_url = body.avatar_url;

    // If a new file is uploaded, push to Cloudinary
    if (file) {
      avatar_url = await this.uploadToCloudinary(file);
    }

    const doctor = await this.getProfile(id);

    // Merge updated fields including the Cloudinary URL
    Object.assign(doctor, {
      ...body,
      fees: body.fees ? Number(body.fees) : doctor.fees,
      avatar_url: avatar_url || doctor.avatar_url,
    });

    return this.doctorRepo.save(doctor);
  }
}
