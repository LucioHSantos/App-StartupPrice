
import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { MarkupTier } from '../types';
import { calculateTotalFixed, calculateCapacityHours, calculatePricing, MARKUP_FACTORS } from '../utils/math';
import { UpgradeModal } from './UpgradeModal';

// Step 1: Splash
export const WizardStep1: React.FC = () => {
  const { setStep, language } = useStore();
  const t = translations[language];
  const logoUrl = "https://i.ibb.co/1YrFgcm5/newlogo.jpg";

  return (
    <div className="flex flex-col items-center text-center gap-8 py-10">
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Decorative background effects */}
        <div className="absolute -inset-10 bg-blue-100/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -inset-4 border-2 border-dashed border-primary/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
        
        <img 
          src={logoUrl} 
          className="w-full h-full object-cover relative z-10 drop-shadow-2xl rounded-full" 
          alt="StartupPrice AI Logo" 
          style={{ backgroundColor: 'transparent' }}
        />
      </div>

      <div className="space-y-4 px-6 relative z-10">
        <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
          {t.tagline}
        </h2>
        <div className="h-1.5 w-16 bg-accent mx-auto rounded-full"></div>
        <p className="text-gray-600 font-bold text-lg italic tracking-wide">
          Pricing smarter, growing stronger.
        </p>
      </div>

      <button 
        onClick={() => setStep(1)}
        className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-200 hover:bg-blue-800 active:scale-[0.98] transition-all relative z-10"
      >
        {t.getStarted} →
      </button>
      
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
        Powered by Gemini AI Technology
      </p>
    </div>
  );
};

// Step 2: Business Setup
export const WizardStep2: React.FC = () => {
  const { setStep, language, businessName, niche, setBusinessInfo, isPremium, setIsPremium, services } = useStore();
  const t = translations[language];
  const [name, setName] = useState(businessName);
  const [selectedNiche, setSelectedNiche] = useState(niche || '');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const niches = [
    { id: 'pet', label: t.niches.pet },
    { id: 'soap', label: t.niches.soap },
    { id: 'saas', label: t.niches.saas },
    { id: 'consulting', label: t.niches.consulting },
    { id: 'ecommerce', label: t.niches.ecommerce }
  ];

  // Check if user already has a business (has completed services)
  const hasExistingBusiness = services.length > 0 || businessName !== '';

  const handleNext = () => {
    // If user is not premium and already has a business, show upgrade
    if (!isPremium && hasExistingBusiness && businessName && businessName !== name) {
      setUpgradeOpen(true);
      return;
    }
    
    if (name) {
      setBusinessInfo(name, selectedNiche);
      setStep(2);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-bold text-accent">{t.step} 1/6</span>
        <h2 className="text-2xl font-bold text-primary">{t.businessName}</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">{t.businessName}</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: PetGrooming LLC"
            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">{t.niche}</label>
          <div className="grid grid-cols-1 gap-2">
            {niches.map(n => (
              <button
                key={n.id}
                onClick={() => setSelectedNiche(n.label)}
                className={`text-left p-4 rounded-xl border-2 transition-all font-medium ${
                  selectedNiche === n.label ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Limit warning */}
      {!isPremium && hasExistingBusiness && businessName && (
        <div className="bg-accent/10 border-2 border-accent/30 p-4 rounded-xl">
          <p className="text-sm font-bold text-gray-700 text-center">
            You've reached the free plan limit. Upgrade to Pro to unlock unlimited businesses and products.
          </p>
        </div>
      )}

      <button 
        onClick={handleNext}
        disabled={!name}
        className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
      >
        {t.next} →
      </button>

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

// Step 3: Fixed Expenses
export const WizardStep3: React.FC = () => {
  const { setStep, language, expenses, setExpenses } = useStore();
  const t = translations[language];
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const [openSection, setOpenSection] = useState<string | null>('financial');

  const total = calculateTotalFixed(localExpenses);

  const updateField = (cat: keyof typeof expenses, field: string, val: string) => {
    const num = parseFloat(val) || 0;
    setLocalExpenses(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: num }
    }));
  };

  const sections = [
    { id: 'financial', title: t.financial, icon: '📈', fields: ['bank_fees', 'card_processing', 'merchant', 'loans'] },
    { id: 'admin', title: t.admin, icon: '🏠', fields: ['rent', 'utilities', 'internet', 'property_tax', 'home_office'] },
    { id: 'payroll', title: t.payroll, icon: '👥', fields: ['self_employment_tax', 'health_insurance', 'workers_comp', 'salary'] },
    { id: 'services', title: t.services, icon: '🔧', fields: ['bookkeeping', 'lawyer', 'saas'] },
    { id: 'marketing', title: t.marketing, icon: '📢', fields: ['ads', 'website'] },
    { id: 'investments', title: t.investments, icon: '💰', fields: ['equipment', 'training'] },
  ];

  const handleNext = () => {
    setExpenses(localExpenses);
    setStep(3);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <span className="text-sm font-bold text-accent">{t.step} 2/6</span>
        <h2 className="text-2xl font-bold text-primary">{t.fixedExpenses}</h2>
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
          <span className="font-semibold text-gray-700">{t.totalMonthly}:</span>
          <span className="text-xl font-bold text-primary">{t.currency}{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 bg-white"
            >
              <span className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-lg">{section.icon}</span> {section.title}
              </span>
              <span className="text-gray-400">{openSection === section.id ? '−' : '+'}</span>
            </button>
            {openSection === section.id && (
              <div className="p-4 pt-0 space-y-3 animate-in fade-in duration-300">
                {section.fields.map(field => (
                  <div key={field} className="flex items-center justify-between gap-4">
                    <label className="text-xs text-gray-500 font-medium flex-1">
                      {(t.fields as any)[field] || field.replace(/_/g, ' ')}
                    </label>
                    <div className="relative w-24">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t.currency}</span>
                       <input 
                         type="number"
                         value={(localExpenses as any)[section.id][field] || ''}
                         onChange={(e) => updateField(section.id as any, field, e.target.value)}
                         placeholder="0"
                         className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-right font-semibold"
                       />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-bold">
          {t.back}
        </button>
        <button onClick={handleNext} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg">
          {t.next} →
        </button>
      </div>
    </div>
  );
};

// Step 4: Capacity
export const WizardStep4: React.FC = () => {
  const { setStep, language, capacity, setCapacity, expenses } = useStore();
  const t = translations[language];
  const [localCapacity, setLocalCapacity] = useState(capacity);

  const totalFixed = calculateTotalFixed(expenses);
  const totalHours = calculateCapacityHours(localCapacity);
  const fixedPerHour = totalHours > 0 ? totalFixed / totalHours : 0;

  const handleNext = () => {
    setCapacity(localCapacity);
    setStep(4);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-bold text-accent">{t.step} 3/6</span>
        <h2 className="text-2xl font-bold text-primary">{t.capacity}</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl font-bold text-primary">{totalHours.toFixed(0)}h</span>
          <span className="text-sm font-medium text-gray-400">{t.totalMonthlyHours}</span>
          <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold">
             ✅ {t.fixedPerHour}: {t.currency}{fixedPerHour.toFixed(2)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>{t.fields.people}</span>
              <span className="text-primary">{localCapacity.people}</span>
            </div>
            <input 
              type="range" min="0" max="10" 
              value={localCapacity.people}
              onChange={(e) => setLocalCapacity(p => ({ ...p, people: parseInt(e.target.value) }))}
              className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>{t.fields.daily_hours}</span>
              <span className="text-primary">{localCapacity.daily_hours}h</span>
            </div>
            <input 
              type="range" min="0" max="24" 
              value={localCapacity.daily_hours}
              onChange={(e) => setLocalCapacity(p => ({ ...p, daily_hours: parseInt(e.target.value) }))}
              className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>{t.fields.productivity}</span>
              <span className="text-primary">{localCapacity.productivity}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={localCapacity.productivity}
              onChange={(e) => setLocalCapacity(p => ({ ...p, productivity: parseInt(e.target.value) }))}
              className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-bold">
          {t.back}
        </button>
        <button onClick={handleNext} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg">
          {t.next} →
        </button>
      </div>
    </div>
  );
};

// Step 5: Markup Selection
export const WizardStep5: React.FC = () => {
  const { setStep, language, selectedTier, setSelectedTier } = useStore();
  const t = translations[language];

  const tiers = [
    { id: MarkupTier.PREMIUM, title: t.tierPremium, desc: t.highEnd, icon: '💎', factor: '3.15x' },
    { id: MarkupTier.PRO, title: t.tierPro, desc: t.standard, icon: '⭐', factor: '2.52x', popular: true },
    { id: MarkupTier.BASIC, title: t.tierBasic, desc: t.entryLevel, icon: '💰', factor: '1.70x' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-bold text-accent">{t.step} 4/6</span>
        <h2 className="text-2xl font-bold text-primary">{t.pricingStrategy}</h2>
      </div>

      <div className="space-y-3">
        {tiers.map(tier => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all relative text-left flex items-center justify-between ${
              selectedTier === tier.id 
                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className="space-y-1">
              {tier.popular && (
                <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold absolute -top-2 left-6">
                  {t.mostPopular}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl">{tier.icon}</span>
                <span className="font-bold text-gray-800">{tier.title}</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{tier.desc}</p>
            </div>
            <span className={`text-lg font-bold ${selectedTier === tier.id ? 'text-primary' : 'text-gray-300'}`}>
              {tier.factor}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(3)} className="flex-1 border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-bold">
          {t.back}
        </button>
        <button onClick={() => setStep(5)} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg">
          {t.next} →
        </button>
      </div>
    </div>
  );
};

// Step 6: Services Entry
export const WizardStep6: React.FC = () => {
  const { setStep, language, services, addService, expenses, capacity, selectedTier, isPremium, setIsPremium } = useStore();
  const t = translations[language];

  const [name, setName] = useState('');
  const [varCost, setVarCost] = useState('');
  const [hours, setHours] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const totalFixed = calculateTotalFixed(expenses);
  const totalHours = calculateCapacityHours(capacity);
  const pricing = calculatePricing(totalFixed, totalHours, parseFloat(varCost) || 0, parseFloat(hours) || 0, selectedTier);

  const FREE_LIMIT_SERVICES = 3;
  const canAddService = isPremium || services.length < FREE_LIMIT_SERVICES;

  const handleAdd = () => {
    if (!canAddService) {
      setUpgradeOpen(true);
      return;
    }
    
    if (name && varCost && hours) {
      addService({
        id: Math.random().toString(36).substr(2, 9),
        name,
        variable_cost: parseFloat(varCost),
        hours_required: parseFloat(hours),
        markup_tier: selectedTier
      });
      setStep(6);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-bold text-accent">{t.step} 5/6</span>
        <h2 className="text-2xl font-bold text-primary">{t.yourServices}</h2>
      </div>

      {/* Limit warning */}
      {!canAddService && (
        <div className="bg-accent/10 border-2 border-accent/30 p-4 rounded-xl">
          <p className="text-sm font-bold text-gray-700 text-center">
            You've reached the free plan limit. Upgrade to Pro to unlock unlimited businesses and products.
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xl space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">{t.serviceName}</label>
          <input 
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Consultoria"
            className="w-full p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-primary transition-all"
            disabled={!canAddService}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">{t.variableCost}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{t.currency}</span>
              <input 
                type="number" value={varCost} onChange={(e) => setVarCost(e.target.value)}
                placeholder="0"
                className="w-full pl-8 p-4 bg-gray-50 rounded-xl outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">{t.hoursRequired}</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">h</span>
              <input 
                type="number" value={hours} onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full p-4 bg-gray-50 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dashed flex justify-between items-end">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.suggestedPrice}</span>
            <div className="text-2xl font-black text-primary">{t.currency}{pricing.suggestedPrice.toFixed(0)}</div>
          </div>
          <div className={`px-3 py-1 text-white text-[10px] font-bold rounded-md flex items-center gap-1 ${name && varCost && hours ? 'bg-success' : 'bg-gray-300'}`}>
            {name && varCost && hours ? `✅ ${t.ready}` : t.waiting}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(4)} className="flex-1 border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-bold">
          {t.back}
        </button>
        <button onClick={handleAdd} disabled={!name || !canAddService} className="flex-[2] bg-accent text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 disabled:opacity-50">
          {t.finish} →
        </button>
      </div>

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

// Step 7: Results
export const WizardStep7: React.FC = () => {
  const { language, expenses, capacity, selectedTier, services, reset, isPremium, setIsPremium } = useStore();
  const t = translations[language];
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const FREE_LIMIT_SERVICES = 3;
  const canAddMoreServices = isPremium || services.length < FREE_LIMIT_SERVICES;

  // Using the last service or default for the breakdown UI
  const service = services[services.length - 1] || { name: 'New Service', variable_cost: 0, hours_required: 0, markup_tier: selectedTier };
  
  const totalFixed = calculateTotalFixed(expenses);
  const totalHours = calculateCapacityHours(capacity);
  const p = calculatePricing(totalFixed, totalHours, service.variable_cost, service.hours_required, service.markup_tier);

  // Derived percentages for breakdown
  const varPct = p.suggestedPrice > 0 ? (service.variable_cost / p.suggestedPrice) * 100 : 0;
  const fixedPct = p.suggestedPrice > 0 ? (p.fixedAllocated / p.suggestedPrice) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-2 text-center">
        <span className="text-sm font-bold text-accent">{t.step} 6/6 - {t.results}</span>
        <h2 className="text-3xl font-black text-primary leading-tight">
          Charge {t.currency}{p.suggestedPrice.toFixed(0)} per {service.name.toLowerCase()}!
        </h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6 border border-gray-100">
        <div className="space-y-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.profitablePrice}</h3>
           <div className="text-5xl font-black text-primary">{t.currency}{p.suggestedPrice.toFixed(0)}</div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">├─ {t.variableCost}</span>
            <span className="font-bold text-gray-800">{t.currency}{service.variable_cost.toFixed(2)} ({varPct.toFixed(0)}%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">├─ {t.fixedAllocated}</span>
            <span className="font-bold text-gray-800">{t.currency}{p.fixedAllocated.toFixed(2)} ({fixedPct.toFixed(0)}%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">├─ {t.technicalHour}</span>
            <span className="font-bold text-gray-800">{t.currency}{p.technicalHourPrice.toFixed(2)}/h</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">└─ {t.fixedUnit}</span>
            <span className="font-bold text-gray-800">{t.currency}{p.fixedPerHour.toFixed(2)}/h</span>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-2xl flex justify-between items-center mt-6">
           <div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.breakEven}</div>
             <div className="text-2xl font-black">{t.currency}{p.breakEven.toLocaleString()}</div>
           </div>
           <div className="text-right">
              <div className="text-xs font-bold text-success">14.9% {t.margin}</div>
              <div className="text-[10px] text-gray-400">{t.targetReached}</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => {
            // Allow reset for premium users, or if no business was completed yet
            if (!isPremium && services.length >= 1) {
              setUpgradeOpen(true);
              return;
            }
            reset();
          }} 
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg"
        >
          {t.saveBusiness}
        </button>
        <button 
          onClick={() => {
            if (!canAddMoreServices) {
              setUpgradeOpen(true);
              return;
            }
            useStore.getState().setStep(5);
          }} 
          className="w-full border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-bold bg-white"
        >
          {t.addAnother}
        </button>
      </div>

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
