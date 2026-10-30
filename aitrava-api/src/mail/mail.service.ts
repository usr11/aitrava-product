import { Global, Injectable, Logger, Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { appUrl } from '../common/config';

const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );

/** Correo con la marca v4: papel, verde pino y botón naranja. */
const layout = (
  title: string,
  body: string,
  cta?: { label: string; url: string },
) => `
<div style="background:#F2EDD5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#04261E">
  <div style="max-width:520px;margin:0 auto;background:#FBF8EC;border-radius:16px;padding:32px;border:1px solid #DCD4B4">
    <p style="margin:0 0 24px;font-weight:800;font-size:20px">aitrava</p>
    <h1 style="margin:0 0 12px;font-size:22px">${esc(title)}</h1>
    <div style="font-size:15px;line-height:1.6;color:#2B4038">${body}</div>
    ${
      cta
        ? `<p style="margin:28px 0"><a href="${cta.url}" style="background:#F26716;color:#04261E;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;display:inline-block">${esc(cta.label)}</a></p>
    <p style="font-size:12px;color:#4A5D52">Si el botón no funciona, copia este enlace:<br><span style="word-break:break-all">${cta.url}</span></p>`
        : ''
    }
    <p style="font-size:12px;color:#6B7B70;margin-top:28px">AiTrava · Ve solo, sal acompañado. Proyecto universitario en Cali.</p>
  </div>
</div>`;

export type MailResult = { sent: boolean; devLink?: string };

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;

  get enabled() {
    return !!this.transport;
  }

  /**
   * Envía el correo. Si no hay SMTP configurado NO finge que se envió: devuelve sent=false
   * y, solo fuera de producción, el enlace para poder probar en local.
   */
  private async send(
    to: string,
    subject: string,
    html: string,
    link: string,
  ): Promise<MailResult> {
    const isProd =
      process.env.NODE_ENV === 'production' ||
      !!process.env.RAILWAY_ENVIRONMENT;
    if (!this.transport) {
      this.logger.warn(
        `SMTP sin configurar: no se envió "${subject}" a ${to}.`,
      );
      if (!isProd) this.logger.log(`Enlace (solo desarrollo): ${link}`);
      return { sent: false, devLink: isProd ? undefined : link };
    }
    try {
      await this.transport.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      return { sent: true };
    } catch (e) {
      this.logger.error(
        `No se pudo enviar "${subject}" a ${to}: ${(e as Error).message}`,
      );
      return { sent: false, devLink: isProd ? undefined : link };
    }
  }

  sendVerification(to: string, firstName: string, token: string) {
    const url = `${appUrl()}/equipo/verificar?token=${token}`;
    return this.send(
      to,
      'Confirma tu correo del equipo AiTrava',
      layout(
        `¡Hola, ${firstName}!`,
        'Confirma tu correo para entrar al panel del equipo. El enlace vence en 24 horas.',
        { label: 'Confirmar mi correo', url },
      ),
      url,
    );
  }

  sendReset(to: string, firstName: string, token: string) {
    const url = `${appUrl()}/equipo/restablecer?token=${token}`;
    return this.send(
      to,
      'Restablece tu contraseña de AiTrava',
      layout(
        `Hola, ${firstName}`,
        'Recibimos una solicitud para cambiar tu contraseña. El enlace vence en 1 hora. Si no fuiste tú, ignora este correo.',
        { label: 'Crear una contraseña nueva', url },
      ),
      url,
    );
  }
}

@Global()
@Module({ providers: [MailService], exports: [MailService] })
export class MailModule {}
