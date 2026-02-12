export type ExchangeRates = Record<string, number>

export const fetchExchangeRates = async (
  base: string = "NGN"
): Promise<ExchangeRates> => {
  const res = await fetch(`/api/exchange-rate?base=${base}`)

  if (!res.ok) {
    throw new Error("Failed to load exchange rates")
  }

  const data = await res.json()

  return data.rates
}
