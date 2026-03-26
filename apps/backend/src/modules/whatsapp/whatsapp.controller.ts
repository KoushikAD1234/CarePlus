import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('webhook')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  @Post()
  handleWebhook(@Body() body: any) {
    return this.whatsappService.handleIncoming(body);
  }
}
