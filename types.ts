
export type Language = 'en' | 'pt' | 'es';

export interface Expenses {
  financial: {
    bank_fees: number;
    card_processing: number;
    merchant: number;
    loans: number;
  };
  admin: {
    rent: number;
    utilities: number;
    internet: number;
    property_tax: number;
    home_office: number;
  };
  payroll: {
    self_employment_tax: number;
    health_insurance: number;
    workers_comp: number;
    salary: number;
  };
  services: {
    bookkeeping: number;
    lawyer: number;
    saas: number;
  };
  marketing: {
    ads: number;
    website: number;
  };
  investments: {
    equipment: number;
    training: number;
  };
}

export interface Capacity {
  people: number;
  daily_hours: number;
  monthly_days: number;
  productivity: number;
}

export enum MarkupTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export interface Service {
  id: string;
  name: string;
  variable_cost: number;
  hours_required: number;
  markup_tier: MarkupTier;
}

export interface BusinessState {
  language: Language;
  step: number;
  isPro: boolean;
  isPremium: boolean;
  businessName: string;
  niche: string;
  expenses: Expenses;
  capacity: Capacity;
  services: Service[];
  selectedTier: MarkupTier;
}
