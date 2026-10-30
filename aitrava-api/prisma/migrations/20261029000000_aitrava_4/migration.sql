-- AiTrava v4: borra lo de la v3 (viajes, Bóveda, ahorro, pagos, Pass, proveedores, destinos, mensajes, feedback).
-- Conserva usuarios, eventos e iteraciones. Los costos de la v3 (pasarela del Pass) no aplican al modelo nuevo.
DELETE FROM "AdminCost";

-- CreateEnum
CREATE TYPE "PlaceLine" AS ENUM ('URBANO', 'NATURALEZA', 'ESCAPADA');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('active', 'verify', 'excluded');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('prospect', 'contacted', 'interested', 'accepted', 'declined', 'active');

-- CreateEnum
CREATE TYPE "SalidaStatus" AS ENUM ('draft', 'open', 'closed', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('requested', 'confirmed', 'payment_reported', 'paid', 'attended', 'no_show', 'cancelled', 'expired');

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_userId_fkey";

-- DropForeignKey
ALTER TABLE "ItineraryItem" DROP CONSTRAINT "ItineraryItem_tripId_fkey";

-- DropForeignKey
ALTER TABLE "ItineraryItem" DROP CONSTRAINT "ItineraryItem_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tripId_fkey";

-- DropForeignKey
ALTER TABLE "VaultDocument" DROP CONSTRAINT "VaultDocument_userId_fkey";

-- DropForeignKey
ALTER TABLE "VaultDocument" DROP CONSTRAINT "VaultDocument_tripId_fkey";

-- DropForeignKey
ALTER TABLE "VaultDocument" DROP CONSTRAINT "VaultDocument_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_tripId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsPlan" DROP CONSTRAINT "SavingsPlan_tripId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsContribution" DROP CONSTRAINT "SavingsContribution_planId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Pass" DROP CONSTRAINT "Pass_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pass" DROP CONSTRAINT "Pass_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Pass" DROP CONSTRAINT "Pass_paymentId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "utmSource";

-- AlterTable
ALTER TABLE "AdminCost" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "salidaId" TEXT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "tripId",
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "salidaId" TEXT,
ADD COLUMN     "variant" TEXT;

-- DropTable
DROP TABLE "Destination";

-- DropTable
DROP TABLE "Trip";

-- DropTable
DROP TABLE "ItineraryItem";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "VaultDocument";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "SavingsPlan";

-- DropTable
DROP TABLE "SavingsContribution";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Pass";

-- DropTable
DROP TABLE "Provider";

-- DropTable
DROP TABLE "ContactMessage";

-- DropTable
DROP TABLE "Feedback";

-- DropEnum
DROP TYPE "TripMode";

-- DropEnum
DROP TYPE "SavingsFrequency";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ProviderStatus";

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "line" "PlaceLine" NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "distance" TEXT,
    "refPrice" INTEGER NOT NULL,
    "note" TEXT,
    "status" "PlaceStatus" NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "organization" TEXT,
    "activity" TEXT NOT NULL,
    "area" TEXT,
    "rnt" TEXT,
    "status" "HostStatus" NOT NULL DEFAULT 'prospect',
    "commissionAccepted" DOUBLE PRECISION,
    "acceptedAt" TIMESTAMP(3),
    "isTestHost" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salida" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "hostId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "meetingPoint" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "minToRun" INTEGER NOT NULL DEFAULT 5,
    "price" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL DEFAULT 0,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "includes" TEXT[],
    "womenOnly" BOOLEAN NOT NULL DEFAULT false,
    "paymentInstructions" TEXT,
    "status" "SalidaStatus" NOT NULL DEFAULT 'draft',
    "isSimulacro" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "hostNewClients" INTEGER,
    "coordinatorHours" DOUBLE PRECISION,
    "commissionPaidAt" TIMESTAMP(3),
    "commissionPaidAmount" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "surveyTokenHash" TEXT,
    "salidaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isAdult" BOOLEAN NOT NULL,
    "inCali" BOOLEAN NOT NULL,
    "knowsTeam" BOOLEAN NOT NULL,
    "heardFrom" TEXT NOT NULL,
    "channel" TEXT,
    "variant" TEXT,
    "motivation" TEXT NOT NULL,
    "intentValid" BOOLEAN,
    "comesAlone" BOOLEAN NOT NULL,
    "phoneChallenge" BOOLEAN NOT NULL DEFAULT false,
    "challengeCompleted" BOOLEAN,
    "price" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'requested',
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "paymentReportedAt" TIMESTAMP(3),
    "paymentNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "refundNote" TEXT,
    "adminNotes" TEXT,
    "anonId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "cameAlone" BOOLEAN NOT NULL,
    "newContact" BOOLEAN NOT NULL,
    "nps" INTEGER NOT NULL,
    "wouldReturn" BOOLEAN NOT NULL,
    "returnPlace" TEXT,
    "improve" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line" "PlaceLine",
    "motivation" TEXT,
    "variant" TEXT,
    "channel" TEXT,
    "anonId" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE INDEX "Host_status_idx" ON "Host"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Salida_slug_key" ON "Salida"("slug");

-- CreateIndex
CREATE INDEX "Salida_status_startsAt_idx" ON "Salida"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_number_key" ON "Reservation"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_tokenHash_key" ON "Reservation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_surveyTokenHash_key" ON "Reservation"("surveyTokenHash");

-- CreateIndex
CREATE INDEX "Reservation_salidaId_status_idx" ON "Reservation"("salidaId", "status");

-- CreateIndex
CREATE INDEX "Reservation_phone_idx" ON "Reservation"("phone");

-- CreateIndex
CREATE INDEX "Reservation_status_holdUntil_idx" ON "Reservation"("status", "holdUntil");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_reservationId_key" ON "SurveyResponse"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_phone_key" ON "WaitlistEntry"("phone");

-- CreateIndex
CREATE INDEX "AdminCost_date_idx" ON "AdminCost"("date");

-- CreateIndex
CREATE INDEX "Event_anonId_idx" ON "Event"("anonId");

-- AddForeignKey
ALTER TABLE "Salida" ADD CONSTRAINT "Salida_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salida" ADD CONSTRAINT "Salida_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_salidaId_fkey" FOREIGN KEY ("salidaId") REFERENCES "Salida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCost" ADD CONSTRAINT "AdminCost_salidaId_fkey" FOREIGN KEY ("salidaId") REFERENCES "Salida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

