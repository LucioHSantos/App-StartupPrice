import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper para gerenciar variáveis de ambiente
 * Garante que todas as variáveis necessárias estejam definidas
 */
export const env = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PRICE_ID_PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://start-up-price-ai.vercel.app',
  PORT: parseInt(process.env.PORT || '3001', 10),
};

// Validação de variáveis obrigatórias
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_PRO_MONTHLY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}



