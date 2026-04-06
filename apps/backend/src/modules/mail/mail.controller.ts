import { Controller, Post, Body, Req } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { QueryDto } from '../../dto/query.dto';

@Controller('contact')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post()
  async handleQuery(@Body() body: QueryDto, @Req() req: any) {
    const user = req.user;

    const data = {
      name: body.name || user?.name || 'Guest',
      email: body.email || user?.email || 'Not Provided',
      subject: body.subject || 'General Inquiry',
      message: body.message,
      userId: user?.id || null,
    };

    await this.mailService.sendContactMail(data);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }
}
