-- CreateEnum
CREATE TYPE "ModoAtendimento" AS ENUM ('IA', 'HUMANO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "modoAtendimento" "ModoAtendimento" NOT NULL DEFAULT 'IA';
