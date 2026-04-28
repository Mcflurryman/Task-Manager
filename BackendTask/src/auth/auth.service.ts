import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

type PendingCode = {
  code: string;
  expiresAt: number;
};

@Injectable()
export class AuthService {
  private static readonly SECURITY_CODE_TTL_MS = 5 * 60 * 1000;

  private pendingCodes = new Map<string, PendingCode>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{
    success: boolean;
    delivered?: boolean;
    access_token?: string;
    devCode?: string;
    message?: string;
    reason?: string;
    skippedSecurityCode?: boolean;
  }> {
    const user = await this.usersService.findOne(email);

    if (!user || user.password !== pass) {
      throw new UnauthorizedException();
    }

    if (process.env.SKIP_SECURITY_CODE === 'true') {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      return {
        success: true,
        access_token: await this.jwtService.signAsync(payload),
        skippedSecurityCode: true,
        message: 'Codigo de seguridad omitido para pruebas.',
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.pendingCodes.set(email, {
      code,
      expiresAt: Date.now() + AuthService.SECURITY_CODE_TTL_MS,
    });

    const mailResult = await this.mailService.sendSecurityCode(email, code);

    if (!mailResult.delivered) {
      return {
        success: true,
        delivered: false,
        devCode: code,
        message:
          'No se pudo enviar el correo. Se devuelve el codigo para pruebas en local. El codigo caduca en 5 minutos.',
        reason: mailResult.reason,
      };
    }

    return {
      success: true,
      delivered: true,
      message:
        'Correo enviado correctamente. Revisa tu bandeja de entrada. El codigo caduca en 5 minutos.',
    };
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);
    const savedCode = this.pendingCodes.get(email);

    if (!user || !savedCode) {
      throw new UnauthorizedException('Codigo incorrecto');
    }

    if (savedCode.expiresAt < Date.now()) {
      this.pendingCodes.delete(email);
      throw new UnauthorizedException('Codigo expirado');
    }

    if (savedCode.code !== code) {
      throw new UnauthorizedException('Codigo incorrecto');
    }

    this.pendingCodes.delete(email);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  logout(): { success: boolean; message: string } {
    return {
      success: true,
      message: 'Sesion cerrada correctamente.',
    };
  }
}
