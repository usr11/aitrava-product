-- Aliados por destino y reserva concreta del viaje (comisión de aliados)
ALTER TABLE "Destination" ADD COLUMN "providers" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Trip" ADD COLUMN "booking" JSONB;
ALTER TABLE "Trip" ADD COLUMN "partnerCommission" INTEGER NOT NULL DEFAULT 0;
