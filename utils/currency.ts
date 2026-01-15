
// Função para buscar a cotação do dólar (USD) para real brasileiro (BRL)
export async function getUSDToBRLRate(): Promise<number> {
  try {
    // Usando API pública gratuita do ExchangeRate-API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.BRL || 5.0; // Fallback para 5.0 se a API falhar
  } catch (error) {
    console.error('Erro ao buscar cotação do dólar:', error);
    // Retorna uma cotação padrão caso a API falhe
    return 5.0;
  }
}

// Função para converter USD para BRL
export async function convertUSDToBRL(usdAmount: number): Promise<number> {
  const rate = await getUSDToBRLRate();
  return usdAmount * rate;
}

// Função para formatar o preço em reais (formato brasileiro)
export function formatBRLPrice(amount: number): string {
  // Formata com 2 casas decimais e substitui ponto por vírgula
  const formatted = amount.toFixed(2).replace('.', ',');
  return `R$${formatted}`;
}
