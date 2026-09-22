-- Modelo de ingresos: comisión única por viaje (sin planes ni pistas pagas)
ALTER TABLE "Trip" DROP COLUMN "plan";
ALTER TABLE "Clue" DROP COLUMN "paid";
