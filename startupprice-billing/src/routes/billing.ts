import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../stripe';
import { env } from '../env';
import { setUserPremium } from '../db';

const router = express.Router();

/**
 * POST /api/billing/create-checkout-session
 * 
 * Cria uma sessão de checkout do Stripe para o plano Pro mensal ($5/mês)
 * 
 * Request body:
 * {
 *   "userId": "string",
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "url": "https://checkout.stripe.com/..."
 * }
 */
router.post('/create-checkout-session', express.json(), async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    // Validação básica
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({
        error: 'userId é obrigatório e deve ser uma string não vazia',
      });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        error: 'email é obrigatório e deve ser uma string não vazia',
      });
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'email deve ter um formato válido',
      });
    }

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: env.STRIPE_PRICE_ID_PRO_MONTHLY,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        userId,
        email,
      },
      success_url: `${env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/billing/cancel`,
    });

    // Log apenas informações não sensíveis
    console.log(`[Checkout] Sessão criada para userId=${userId}, email=${email}, sessionId=${session.id}`);

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error('[Checkout] Erro ao criar sessão:', error);

    // Retornar erro genérico para o cliente
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(500).json({
        error: 'Erro ao processar pagamento. Tente novamente mais tarde.',
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /api/billing/webhook
 * 
 * Endpoint para receber webhooks do Stripe
 * 
 * IMPORTANTE: Este endpoint usa express.raw() para preservar o body original
 * necessário para verificação da assinatura do webhook.
 * 
 * Eventos tratados:
 * - checkout.session.completed: Marca o usuário como Premium após pagamento bem-sucedido
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Webhook] Assinatura não encontrada no header');
    return res.status(400).json({ error: 'Assinatura não encontrada' });
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = err as Error;
    console.error('[Webhook] Erro na verificação da assinatura:', error.message);
    return res.status(400).json({ error: 'Assinatura inválida' });
  }

  // Processar eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extrair userId e email dos metadados ou customer_email
        const userId = session.metadata?.userId;
        const email = session.metadata?.email || session.customer_email || session.customer_details?.email;

        if (!userId || !email) {
          console.error('[Webhook] userId ou email não encontrados na sessão', {
            sessionId: session.id,
            metadata: session.metadata,
          });
          return res.status(400).json({ error: 'Dados do usuário não encontrados' });
        }

        // Marcar usuário como Premium
        await setUserPremium(userId, email);

        console.log(`[Webhook] Usuário atualizado para Premium: userId=${userId}, email=${email}, sessionId=${session.id}`);

        break;
      }

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`);
    }

    // Retornar 200 para confirmar recebimento
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] Erro ao processar evento:', error);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

export default router;



