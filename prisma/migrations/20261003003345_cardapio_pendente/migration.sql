-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "telefoneAdministrador" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardapioPendente" (
    "id" TEXT NOT NULL,
    "acompanhamentos" JSONB NOT NULL,
    "proteinas" JSONB NOT NULL,
    "saladas" JSONB NOT NULL,
    "criadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardapioPendente_pkey" PRIMARY KEY ("id")
);
