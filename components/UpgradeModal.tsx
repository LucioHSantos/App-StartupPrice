
import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  onConfirmUpgrade,
}) => {
  const { businessName, language } = useStore();
  const t = translations[language].upgradeModal;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(() => {
    // Tentar obter email salvo ou usar vazio
    if (typeof window !== 'undefined') {
      return localStorage.getItem('startupprice_user_email') || '';
    }
    return '';
  });

  // URL da API de billing - ajuste conforme necessário
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const buyNow = async () => {
    setLoading(true);
    setError(null);

    // Validar email
    if (!email || !email.includes('@')) {
      setError(t.emailError);
      setLoading(false);
      return;
    }

    try {
      // Gerar um userId único se não existir
      let userId = localStorage.getItem('startupprice_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('startupprice_user_id', userId);
      }

      // Salvar email no localStorage
      localStorage.setItem('startupprice_user_email', email);

      const res = await fetch(`${API_URL}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t.checkoutError);
      }

      const data = await res.json();
      
      // Redirecionar para o checkout do Stripe
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t.checkoutUrlError);
      }
    } catch (err) {
      console.error('Erro ao processar compra:', err);
      setError(err instanceof Error ? err.message : t.generalError);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary">
            {t.title}
          </h2>
          <div className="h-1 w-16 bg-accent rounded-full"></div>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">{t.feature1}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">{t.feature2}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">{t.feature3}</span>
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">{t.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            disabled={loading}
            className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={buyNow}
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-orange-400 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-orange-200 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? t.processing : t.buyButton}
          </button>
          <button
            onClick={onConfirmUpgrade}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {t.testButton}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full border-2 border-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-bold hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
};

