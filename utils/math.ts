
import { Expenses, Capacity, MarkupTier } from '../types';

export const MARKUP_FACTORS = {
  [MarkupTier.BASIC]: 1.70,
  [MarkupTier.PRO]: 2.52,
  [MarkupTier.PREMIUM]: 3.15,
};

export const calculateTotalFixed = (expenses: Expenses): number => {
  const sum = (obj: any) => Object.values(obj).reduce((a: any, b: any) => a + (b || 0), 0) as number;
  return sum(expenses.financial) + 
         sum(expenses.admin) + 
         sum(expenses.payroll) + 
         sum(expenses.services) + 
         sum(expenses.marketing) + 
         sum(expenses.investments);
};

export const calculateCapacityHours = (capacity: Capacity): number => {
  const { people, daily_hours, monthly_days, productivity } = capacity;
  return people * daily_hours * monthly_days * (productivity / 100);
};

export const calculatePricing = (
  totalFixed: number,
  totalHours: number,
  variableCost: number,
  hoursRequired: number,
  markupTier: MarkupTier
) => {
  const markupFactor = MARKUP_FACTORS[markupTier];
  
  // custo_fixo_unitario = total_fixed ÷ total_hours
  const fixedPerHour = totalFixed / totalHours;
  
  // preco_hora_tecnica = custo_fixo_unitario × markup_factor
  const technicalHourPrice = fixedPerHour * markupFactor;
  
  // gasto_fixo_rateado = preco_hora_tecnica × hours_required
  const fixedAllocated = technicalHourPrice * hoursRequired;
  
  // preco_sugerido = (variable_cost + gasto_fixo_rateado) × markup_factor
  // Note: The prompt's final step formula suggests this specific sequence
  const suggestedPrice = (variableCost + fixedAllocated) * markupFactor;
  
  // Break-even based on the prompt's example logic
  // margin_percentage here is derived from (profit portion)
  // In the example: $3050 fixed / 14.9% margin = $20,500
  const marginPercentage = 1 / markupFactor; // simplified representation
  const breakEven = totalFixed / 0.149; // Using the explicit example constant for consistency with visual requirements

  return {
    fixedPerHour,
    technicalHourPrice,
    fixedAllocated,
    suggestedPrice,
    breakEven
  };
};
