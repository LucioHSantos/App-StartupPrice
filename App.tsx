
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { translations } from './translations';
import { WizardStep1, WizardStep2, WizardStep3, WizardStep4, WizardStep5, WizardStep6, WizardStep7 } from './components/WizardSteps';
import { LanguageToggle } from './components/LanguageToggle';
import { ProgressBar } from './components/ProgressBar';
import { UpgradeModal } from './components/UpgradeModal';
import { convertUSDToBRL, formatBRLPrice } from './utils/currency';

const App: React.FC = () => {
  const { step, language, setIsPremium } = useStore();
  const t = translations[language];
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [proBannerText, setProBannerText] = useState(t.proBanner);

  // Atualizar o texto do banner com conversão de moeda para português
  useEffect(() => {
    const updateProBannerText = async () => {
      if (language === 'pt') {
        const usdPrice = 5;
        const brlPrice = await convertUSDToBRL(usdPrice);
        const formattedPrice = formatBRLPrice(brlPrice);
        setProBannerText(`Mude agora para versão pro ${formattedPrice}`);
      } else {
        setProBannerText(t.proBanner);
      }
    };

    updateProBannerText();
  }, [language, t.proBanner]);

  const renderStep = () => {
    switch (step) {
      case 0: return <WizardStep1 />;
      case 1: return <WizardStep2 />;
      case 2: return <WizardStep3 />;
      case 3: return <WizardStep4 />;
      case 4: return <WizardStep5 />;
      case 5: return <WizardStep6 />;
      case 6: return <WizardStep7 />;
      default: return <WizardStep1 />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8">
      {/* Container to mimic mobile phone width on desktop */}
      <div className="w-full max-w-md flex flex-col gap-6 relative">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="bg-accent text-white p-1 rounded-md text-sm">AI</span>
              {t.title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">{t.tagline}</p>
          </div>
          <LanguageToggle />
        </div>

        {/* Step Progress */}
        {step > 0 && <ProgressBar current={step} total={6} />}

        {/* Main Content */}
        <main className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderStep()}
        </main>

        {/* Pro Banner */}
        {step > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm">
             <button 
               onClick={() => setUpgradeOpen(true)}
               className="w-full bg-gradient-to-r from-accent to-orange-400 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-orange-200 transform active:scale-95 transition-all text-sm"
             >
               {proBannerText}
             </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onConfirmUpgrade={() => {
          setIsPremium(true);
          setUpgradeOpen(false);
        }}
      />
    </div>
  );
};

export default App;
