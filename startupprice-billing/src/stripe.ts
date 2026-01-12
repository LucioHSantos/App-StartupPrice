import Stripe from 'stripe';
import { env } from './env';

/**
 * Instância configurada do Stripe
 * 
 * API Version: 2024-04-10 (ou a mais recente disponível)
 * Você pode atualizar a versão da API conforme necessário
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});



