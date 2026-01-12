# StartupPrice AI - Billing Microservice

Microserviço de billing usando Stripe para gerenciar assinaturas do plano Pro ($5/mês) do StartupPrice AI.

## 🚀 Configuração Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` e configure:

- `STRIPE_SECRET_KEY`: Sua chave secreta do Stripe (encontrada em [Stripe Dashboard](https://dashboard.stripe.com/apikeys))
- `STRIPE_WEBHOOK_SECRET`: Secret do webhook (você obtém isso após configurar o endpoint no Stripe Dashboard)
- `STRIPE_PRICE_ID_PRO_MONTHLY`: ID do preço mensal do plano Pro (formato: `price_xxxxx`)
- `FRONTEND_URL`: URL do seu front-end (padrão: `https://start-up-price-ai.vercel.app`)
- `PORT`: Porta do servidor (opcional, padrão: `3001`)

### 3. Configurar Stripe Dashboard

1. **Criar Product + Price**:
   - Vá para [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
   - Crie um produto "Pro Plan"
   - Adicione um preço recorrente mensal de $5.00
   - Copie o Price ID (formato `price_xxxxx`) para o `.env`

2. **Configurar Webhook**:
   - Vá para [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Clique em "Add endpoint"
   - URL: `https://seu-dominio.com/api/billing/webhook` (ou use [Stripe CLI](https://stripe.com/docs/stripe-cli) para testes locais)
   - Selecione eventos: `checkout.session.completed`
   - Copie o "Signing secret" para `STRIPE_WEBHOOK_SECRET` no `.env`

### 4. Executar o servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3001` (ou na porta definida em `PORT`).

## 📡 Endpoints

### `POST /api/billing/create-checkout-session`

Cria uma sessão de checkout do Stripe para o plano Pro.

**Request:**
```json
{
  "userId": "user_123",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

### `POST /api/billing/webhook`

Endpoint para receber webhooks do Stripe. Não deve ser chamado diretamente pelo front-end.

### `GET /health`

Health check do servidor.

**Response:**
```json
{
  "ok": true
}
```

## 🔌 Integração com o Front-end

### 1. Criar sessão de checkout

No seu front-end (Vite app), faça uma requisição para criar a sessão de checkout:

```typescript
async function createCheckoutSession(userId: string, email: string) {
  try {
    const response = await fetch('https://seu-billing-service.com/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar sessão de checkout');
    }

    const data = await response.json();
    return data.url; // URL do checkout do Stripe
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
```

### 2. Redirecionar para o Stripe Checkout

```typescript
const checkoutUrl = await createCheckoutSession(userId, email);
// Redireciona o usuário para a página de checkout do Stripe
window.location.href = checkoutUrl;
```

### 3. Tratar retorno após pagamento

Quando o usuário completa o pagamento, o Stripe redireciona para:

```
https://seu-frontend.com/billing/success?session_id=cs_xxxxx
```

Na rota `/billing/success` do seu front-end:

```typescript
// Exemplo em React/Vite
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Atualizar estado do usuário para Premium
      // Exemplo: fazer uma requisição para sua API para atualizar o estado do usuário
      refreshUserData();
    }
  }, [sessionId]);

  return (
    <div>
      <h1>Pagamento confirmado!</h1>
      <p>Seu plano Pro foi ativado com sucesso.</p>
    </div>
  );
}

async function refreshUserData() {
  // Chamar sua API para obter os dados atualizados do usuário
  // O microserviço de billing já marcou o usuário como Premium no banco
  // Você precisa buscar os dados atualizados do seu backend principal
  const response = await fetch('/api/user/me');
  const userData = await response.json();
  // Atualizar estado local/store com userData.isPremium = true
}
```

### 4. Verificar status Premium

Após o retorno do Stripe, o webhook já processou e marcou o usuário como Premium. No seu backend principal, você pode:

1. Buscar o status do usuário diretamente do banco de dados compartilhado
2. Ou fazer uma requisição ao microserviço de billing (se você expuser um endpoint GET)

## 🗄️ Banco de Dados

**IMPORTANTE**: Este microserviço atualmente usa um banco de dados em memória temporário.

### Substituir por banco real

O arquivo `src/db.ts` contém a interface que você precisa implementar:

```typescript
// Função principal que precisa ser implementada com seu banco real
export async function setUserPremium(userId: string, email: string): Promise<void>
```

**Onde substituir:**

1. Abra `src/db.ts`
2. Substitua a implementação em memória por chamadas ao seu banco real (PostgreSQL, MongoDB, etc.)
3. Certifique-se de manter a mesma interface de funções

**Exemplo com Prisma (PostgreSQL):**

```typescript
import { prisma } from './prisma'; // sua configuração do Prisma

export async function setUserPremium(userId: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    update: { 
      email,
      isPremium: true,
    },
    create: {
      id: userId,
      email,
      isPremium: true,
    },
  });
}
```

## 🧪 Testes Locais com Stripe CLI

Para testar webhooks localmente, use a [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: ver instruções no site

# Fazer login
stripe login

# Encaminhar webhooks para o servidor local
stripe listen --forward-to localhost:3001/api/billing/webhook

# O output mostrará o webhook secret, use-o no .env como STRIPE_WEBHOOK_SECRET
```

## 🔒 Segurança

- ✅ Validação de assinatura de webhooks do Stripe
- ✅ Validação de entrada (userId, email)
- ✅ Logs não expõem dados sensíveis
- ✅ Erros genéricos retornados ao cliente
- ✅ Detalhes de erro apenas no servidor

## 📝 Logs

O servidor loga:
- Requisições recebidas (método, path, timestamp)
- Criação de sessões de checkout (userId, email, sessionId)
- Processamento de webhooks (tipo de evento, userId, email)
- Erros (detalhados no console do servidor)

## 🚢 Deploy

### Vercel / Netlify Functions

Este é um servidor Express padrão. Para deploy:

1. **Vercel**: Configure o `vercel.json` para apontar para `src/server.ts`
2. **Railway / Render**: Deploy direto do código, configure as variáveis de ambiente
3. **Docker**: Crie um `Dockerfile` baseado em Node.js

### Exemplo Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## 📚 Recursos

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)



