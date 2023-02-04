// @ts-nocheck
import nodemailer from 'nodemailer';
import { EMAIL_FROM, config } from '@config/config';

class EmailSender {
  constructor() {
    this.transport = nodemailer.createTransport({
      host: config.emailServer,
      port: 587,
      secure: false,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
  }

  sendEmail = async ({
    to,
    subject,
    html,
    attachments = null,
  }) => {
    const emailObject = {
      from: EMAIL_FROM,
      to,
      subject,
      html,
    };

    if (attachments) {
      Object.assign(emailObject, {
        attachments,
      });
    }

    await this.transport.sendMail(emailObject);
  }
}

export default new EmailSender();
