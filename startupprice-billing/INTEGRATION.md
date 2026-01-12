# Guia de Integração Front-end

Este documento explica como integrar o microserviço de billing com seu front-end Vite/React.

## 📋 Pré-requisitos

1. O microserviço de billing está rodando e acessível
2. Você tem a URL do serviço (ex: `https://billing.startupprice.ai` ou `http://localhost:3001`)

## 🔧 Configuração

No seu front-end, crie um arquivo de configuração ou adicione às variáveis de ambiente:

```typescript
// src/config/billing.ts
export const BILLING_SERVICE_URL = import.meta.env.VITE_BILLING_SERVICE_URL || 'http://localhost:3001';
```

No `.env` do front-end:
```
VITE_BILLING_SERVICE_URL=https://seu-billing-service.com
```

## 💳 Criar Sessão de Checkout

### 1. Função para criar checkout

```typescript
// src/services/billing.ts
interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
}

interface CheckoutSessionResponse {
  url: string;
}

export async function createCheckoutSession({
  userId,
  email,
}: CreateCheckoutSessionParams): Promise<string> {
  const response = await fetch(`${BILLING_SERVICE_URL}/api/billing/create-checkout-session`, {
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
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar sessão de checkout');
  }

  const data: CheckoutSessionResponse = await response.json();
  return data.url;
}
```

### 2. Componente de botão de upgrade

```typescript
// src/components/UpgradeButton.tsx
import { useState } from 'react';
import { createCheckoutSession } from '../services/billing';
import { useAuth } from '../hooks/useAuth'; // seu hook de autenticação

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // assumindo que você tem um hook de auth

  const handleUpgrade = async () => {
    if (!user) {
      alert('Você precisa estar logado para fazer upgrade');
      return;
    }

    setLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession({
        userId: user.id,
        email: user.email,
      });

      // Redirecionar para o Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao iniciar o processo de pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="upgrade-button"
    >
      {loading ? 'Carregando...' : 'Fazer Upgrade para Pro - $5/mês'}
    </button>
  );
}
```

## ✅ Página de Sucesso

### 1. Criar rota de sucesso

No seu router (React Router):

```typescript
// src/App.tsx ou routes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BillingSuccess } from './pages/BillingSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* outras rotas */}
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Componente de sucesso

```typescript
// src/pages/BillingSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { refreshUserData } from '../services/auth'; // sua função para atualizar dados do usuário

export function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function handleSuccess() {
      if (!sessionId) {
        console.error('Session ID não encontrado');
        setLoading(false);
        return;
      }

      try {
        // Aguardar alguns segundos para garantir que o webhook foi processado
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Atualizar dados do usuário
        await refreshUserData();

        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar sucesso:', error);
        setLoading(false);
      }
    }

    handleSuccess();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="billing-success">
        <h1>Processando pagamento...</h1>
        <p>Aguarde enquanto confirmamos seu pagamento.</p>
      </div>
    );
  }

  return (
    <div className="billing-success">
      <h1>🎉 Pagamento confirmado!</h1>
      <p>Seu plano Pro foi ativado com sucesso.</p>
      <p>Você agora tem acesso a todos os recursos Premium.</p>
      <button onClick={() => navigate('/')}>
        Voltar para o início
      </button>
    </div>
  );
}
```

### 3. Componente de cancelamento

```typescript
// src/pages/BillingCancel.tsx
import { useNavigate } from 'react-router-dom';

export function BillingCancel() {
  const navigate = useNavigate();

  return (
    <div className="billing-cancel">
      <h1>Pagamento cancelado</h1>
      <p>Você cancelou o processo de pagamento.</p>
      <button onClick={() => navigate('/')}>
        Voltar para o início
      </button>
    </div>
  );
}
```

## 🔄 Atualizar Estado do Usuário

### Função para atualizar dados do usuário

```typescript
// src/services/auth.ts
export async function refreshUserData() {
  // Chamar sua API principal para obter dados atualizados
  // O microserviço de billing já marcou o usuário como Premium
  const response = await fetch('/api/user/me', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`, // sua função de auth
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar dados do usuário');
  }

  const userData = await response.json();

  // Atualizar store/context com os novos dados
  // Exemplo com Zustand:
  useUserStore.getState().setUser({
    ...userData,
    isPremium: true, // garantir que está marcado como Premium
  });

  return userData;
}
```

## 📝 Exemplo Completo com Context API

Se você usa Context API para gerenciar estado:

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { refreshUserData } from '../services/auth';

interface User {
  id: string;
  email: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      const userData = await refreshUserData();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  // Na página de sucesso, chamar refreshUser()
  // useEffect(() => { refreshUser(); }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        refreshUser,
        isPremium: user?.isPremium ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

## 🎨 Exemplo de Uso no Modal de Upgrade

```typescript
// src/components/UpgradeModal.tsx
import { useState } from 'react';
import { createCheckoutSession } from '../services/billing';
import { useAuth } from '../contexts/AuthContext';

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession({
        userId: user.id,
        email: user.email,
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  if (user?.isPremium) {
    return (
      <div className="modal">
        <h2>Você já é Premium! 🎉</h2>
        <button onClick={onClose}>Fechar</button>
      </div>
    );
  }

  return (
    <div className="modal">
      <h2>Fazer Upgrade para Pro</h2>
      <p>Desbloqueie todos os recursos Premium por apenas $5/mês</p>
      <ul>
        <li>✅ Recursos ilimitados</li>
        <li>✅ Suporte prioritário</li>
        <li>✅ Novidades exclusivas</li>
      </ul>
      <div className="modal-actions">
        <button onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button onClick={handleUpgrade} disabled={loading}>
          {loading ? 'Processando...' : 'Assinar agora - $5/mês'}
        </button>
      </div>
    </div>
  );
}
```

## 🔍 Verificar Status Premium

Para verificar se um usuário é Premium antes de mostrar conteúdo:

```typescript
// src/components/PremiumContent.tsx
import { useAuth } from '../contexts/AuthContext';
import { UpgradeButton } from './UpgradeButton';

export function PremiumContent({ children }: { children: React.ReactNode }) {
  const { isPremium } = useAuth();

  if (!isPremium) {
    return (
      <div className="premium-gate">
        <h3>Conteúdo Premium</h3>
        <p>Faça upgrade para acessar este conteúdo</p>
        <UpgradeButton />
      </div>
    );
  }

  return <>{children}</>;
}
```

## ⚠️ Importante

1. **Webhook delay**: Após o pagamento, aguarde 1-2 segundos antes de atualizar os dados do usuário para garantir que o webhook foi processado.

2. **Error handling**: Sempre trate erros ao chamar o serviço de billing.

3. **Loading states**: Mostre estados de carregamento durante o processo de checkout.

4. **Security**: Nunca exponha suas chaves do Stripe no front-end. Tudo deve passar pelo backend.

5. **Testing**: Use as chaves de teste do Stripe (`sk_test_...`) durante desenvolvimento.

## 🧪 Testando Localmente

Para testar localmente:

1. Inicie o microserviço: `npm run dev` na pasta `startupprice-billing`
2. Use Stripe CLI para encaminhar webhooks: `stripe listen --forward-to localhost:3001/api/billing/webhook`
3. Use cartões de teste do Stripe (ex: `4242 4242 4242 4242`)
4. Configure `VITE_BILLING_SERVICE_URL=http://localhost:3001` no `.env` do front-end



