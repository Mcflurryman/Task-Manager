import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

type SecurityCodeResult = {
  delivered: boolean;
  reason?: string;
  errorMessage?: string;
};

@Injectable()
export class MailService {
  private readonly isConfigured =
    !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;

  private readonly resend: Resend | null = this.isConfigured
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  async sendSecurityCode(
    to: string,
    code: string,
  ): Promise<SecurityCodeResult> {
    if (!this.resend) {
      console.warn(
        `[mail] RESEND_API_KEY o EMAIL_FROM no estan configurados. Codigo para ${to}: ${code}`,
      );
      return {
        delivered: false,
        reason: 'EMAIL_NOT_CONFIGURED',
        errorMessage:
          'Faltan RESEND_API_KEY o EMAIL_FROM en el .env del backend.',
      };
    }

    try {
      const { error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [to],
        subject: 'Codigo de seguridad',
        text: `Tu codigo de seguridad es: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Codigo de seguridad</h2>
            <p>Tu codigo de seguridad es:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
              ${code}
            </p>
          </div>
        `,
      });

      if (error) {
        return {
          delivered: false,
          reason: 'EMAIL_SEND_FAILED',
          errorMessage: error.message,
        };
      }

      return { delivered: true };
    } catch (error) {
      console.error(
        `[mail] Error enviando codigo a ${to}. Codigo local: ${code}`,
        error,
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido enviando email';

      return {
        delivered: false,
        reason: 'EMAIL_SEND_FAILED',
        errorMessage,
      };
    }
  }
}
