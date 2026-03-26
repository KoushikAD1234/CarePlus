import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/database/entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
