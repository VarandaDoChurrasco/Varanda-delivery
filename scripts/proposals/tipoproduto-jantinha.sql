-- PROPOSAL ONLY: not in prisma/migrations and never run by the audit.
-- Use ONLY if the live catalog confirms the enum exists and lacks JANTINHA,
-- and after creating/reviewing a corresponding reconciliation migration.
-- Preserves every existing enum label, its order, and all stored data.
ALTER TYPE "public"."TipoProduto" ADD VALUE IF NOT EXISTS 'JANTINHA';
