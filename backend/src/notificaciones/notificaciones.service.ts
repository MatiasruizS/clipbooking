import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { Resend } from 'resend';

export interface DatosCita {
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  barberoNombre: string;
  servicioNombre: string;
  fecha: string;
  horaInicio: string;
  monto: number;
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatearFecha(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function formatearMonto(monto: number): string {
  return `$${Number(monto).toLocaleString('es-CL')}`;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private twilioClient: ReturnType<typeof twilio> | null = null;
  private resend: Resend | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (sid && token) {
      this.twilioClient = twilio(sid, token);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      this.resend = new Resend(resendKey);
    }
  }

  async enviarConfirmacion(datos: DatosCita): Promise<void> {
    await Promise.allSettled([
      this.enviarWhatsApp(datos),
      this.enviarEmail(datos),
    ]);
  }

  private async enviarWhatsApp(datos: DatosCita): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio no configurado — omitiendo WhatsApp');
      return;
    }

    const from = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886';
    const telefono = datos.clienteTelefono.replace(/\s/g, '');
    const to = telefono.startsWith('whatsapp:') ? telefono : `whatsapp:${telefono}`;

    const mensaje = [
      `✂️ *Reserva confirmada — ClipBooking*`,
      ``,
      `Hola ${datos.clienteNombre}, tu cita está agendada 👇`,
      ``,
      `📅 *Fecha:* ${formatearFecha(datos.fecha)}`,
      `🕐 *Hora:* ${datos.horaInicio}`,
      `✂️ *Servicio:* ${datos.servicioNombre}`,
      `💈 *Barbero:* ${datos.barberoNombre}`,
      `💰 *Precio:* ${formatearMonto(datos.monto)}`,
      ``,
      `Te esperamos. ¡Hasta pronto! 🙌`,
    ].join('\n');

    try {
      await this.twilioClient.messages.create({ from, to, body: mensaje });
      this.logger.log(`WhatsApp enviado a ${to}`);
    } catch (e) {
      this.logger.error(`Error enviando WhatsApp: ${(e as Error).message}`);
    }
  }

  private async enviarEmail(datos: DatosCita): Promise<void> {
    if (!this.resend || !datos.clienteEmail) return;

    const from = process.env.RESEND_FROM ?? 'ClipBooking <onboarding@resend.dev>';
    const asunto = `✂️ Cita confirmada — ${formatearFecha(datos.fecha)} a las ${datos.horaInicio}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

    <div style="background:#18181b;padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">✂️ ClipBooking</h1>
      <p style="margin:4px 0 0;color:#a1a1aa;font-size:13px;">Confirmación de reserva</p>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 24px;color:#374151;font-size:15px;">
        Hola <strong>${datos.clienteNombre}</strong>, tu cita está confirmada. Aquí tienes el resumen:
      </p>

      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
        ${fila('📅 Fecha', formatearFecha(datos.fecha))}
        ${fila('🕐 Hora', datos.horaInicio)}
        ${fila('✂️ Servicio', datos.servicioNombre)}
        ${fila('💈 Barbero', datos.barberoNombre)}
        ${fila('💰 Precio', formatearMonto(datos.monto))}
      </table>

      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;text-align:center;">
        Horario de atención: 10:00 a 20:45 · Lunes a Domingo
      </p>
    </div>

  </div>
</body>
</html>`;

    try {
      await this.resend.emails.send({ from, to: datos.clienteEmail, subject: asunto, html });
      this.logger.log(`Email enviado a ${datos.clienteEmail}`);
    } catch (e) {
      this.logger.error(`Error enviando email: ${(e as Error).message}`);
    }
  }
}

function fila(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;width:40%;">${label}</td>
      <td style="padding:12px 16px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${value}</td>
    </tr>`;
}
