-- Forma de pago elegida: "reserva" (tarifa fija de $39.900) o "completo"
ALTER TABLE "Trip" ADD COLUMN "paymentType" TEXT;
